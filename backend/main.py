"""
main.py
-------
FastAPI app.
- WebSocket /ws     → streams MAVLink telemetry at 10Hz
- POST /rpi/data    → receives GPS + frame from RPi sender
- POST /demo/start  → activate demo mode (replayed video + CSV)
- POST /demo/stop   → revert to live Pixhawk feed
- GET  /demo/status → check if demo mode is active

Run:
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
"""

import asyncio
import logging
import time
import threading
from pathlib import Path
from typing import Optional
import io
import base64
import numpy as np
import cv2
from PIL import Image
from flood_inference import run_inference
from demo_streamer import DemoStreamer
from path_planner import compute_rescue_path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from mavlink_reader import MAVLinkReader

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AeroScout Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global state ──────────────────────────────────────────────────────────────

reader = MAVLinkReader()

# Demo mode state
demo_streamer: Optional[DemoStreamer] = None
demo_active: bool = False

# Stores latest data received from RPi
_rpi_state: dict = {
    "ts":        None,
    "lat":       None,
    "lon":       None,
    "alt":       None,
    "speed":     None,
    "fix":       0,
    "satellites": 0,
    "frame_b64": None,
}
_rpi_lock = threading.Lock()

_ml_result: dict | None = None
_ml_lock = threading.Lock()

async def _run_ml_inference(frame_b64: str) -> None:
    global _ml_result
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, run_inference, frame_b64)
    if result is not None:
        try:
            mask_bytes = base64.b64decode(result["mask_b64"])
            mask_img = Image.open(io.BytesIO(mask_bytes)).convert("RGBA")
            alpha = np.array(mask_img)[:,:,3]
            flood_map = (alpha > 0).astype(np.float32)
            drone_pixel = (128, 128)
            path = compute_rescue_path(flood_map, drone_pixel)
            result["rescue_path_pixels"] = path
        except Exception as e:
            logger.error(f"ML post-process err: {e}")
        result["flood_heatmap_b64"] = result.get("flood_heatmap_b64", None)
        result["flood_centroids"]   = result.get("flood_centroids", None)
        with _ml_lock:
            _ml_result = result


# ── Pydantic models ───────────────────────────────────────────────────────────

class GPSData(BaseModel):
    lat:        Optional[float] = None
    lon:        Optional[float] = None
    alt:        Optional[float] = None
    speed:      Optional[float] = None
    fix:        int = 0
    satellites: int = 0

class RPiPayload(BaseModel):
    ts:         float
    gps:        GPSData
    frame_b64:  Optional[str] = None
    source:     str = "rpi"


# ── Startup / Shutdown ────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    reader.start()
    logger.info("MAVLink reader started.")


@app.on_event("shutdown")
async def shutdown():
    global demo_streamer, demo_active
    reader.stop()
    if demo_streamer is not None:
        demo_streamer.release()
        demo_streamer = None
        demo_active = False


# ── HTTP endpoints ────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    state = reader.get_state()
    with _rpi_lock:
        rpi_connected = _rpi_state["ts"] is not None and \
                        (time.time() - _rpi_state["ts"]) < 5.0
    return {
        "status":           "ok",
        "mavlink_connected": state["connected"],
        "mode":             state["mode"],
        "armed":            state["armed"],
        "rpi_connected":    rpi_connected,
    }


@app.post("/rpi/data")
async def receive_rpi_data(payload: RPiPayload):
    with _rpi_lock:
        _rpi_state["ts"]         = payload.ts
        _rpi_state["lat"]        = payload.gps.lat
        _rpi_state["lon"]        = payload.gps.lon
        _rpi_state["alt"]        = payload.gps.alt
        _rpi_state["speed"]      = payload.gps.speed
        _rpi_state["fix"]        = payload.gps.fix
        _rpi_state["satellites"] = payload.gps.satellites
        _rpi_state["frame_b64"]  = payload.frame_b64

    logger.info(
        f"[RPi] fix={payload.gps.fix} "
        f"lat={payload.gps.lat} lon={payload.gps.lon} "
        f"frame={'yes' if payload.frame_b64 else 'no'}"
    )
    return {"status": "ok"}


# ── Demo Mode endpoints ──────────────────────────────────────────────────────

@app.post("/demo/start")
async def demo_start():
    global demo_streamer, demo_active
    _base = Path(__file__).parent / "demo_data"
    demo_streamer = DemoStreamer(
        video_path=str(_base / "aerial_flood.mp4"),
        csv_path=str(_base / "flight_log2.csv"),
    )
    demo_active = True
    logger.info("Demo mode STARTED")
    return {"status": "demo_active"}


@app.post("/demo/stop")
async def demo_stop():
    global demo_streamer, demo_active
    demo_active = False
    if demo_streamer is not None:
        demo_streamer.release()
        demo_streamer = None
    logger.info("Demo mode STOPPED")
    return {"status": "live_active"}


@app.get("/demo/status")
async def demo_status():
    return {"active": demo_active}


# ── WebSocket ─────────────────────────────────────────────────────────────────

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    logger.info("WebSocket client connected.")
    try:
        while True:
            # ── Demo branch ───────────────────────────────────────────
            if demo_active and demo_streamer is not None:
                demo_data = demo_streamer.next_frame()
                frame_bgr = demo_data["frame_bgr"]
                lat       = demo_data["lat"]
                lon       = demo_data["lon"]
                alt_m     = demo_data["alt_m"]
                heading   = demo_data["heading"]
                airspeed  = demo_data["airspeed_mps"]
                sats      = demo_data["satellites"]

                # Encode BGR frame → base64 JPEG
                frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
                pil_img = Image.fromarray(frame_rgb)
                buf = io.BytesIO()
                pil_img.save(buf, format="JPEG", quality=85)
                frame_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

                payload = {
                    "connected":          True,
                    "armed":              True,
                    "mode":               demo_data["fly_state"],
                    "roll":               demo_data["roll"],
                    "pitch":              demo_data["pitch"],
                    "yaw":                heading,
                    "altitude":           round(alt_m, 2),
                    "alt_msl":            round(alt_m, 2),
                    "alt_rel":            round(alt_m, 2),
                    "heading":            int(heading),
                    "throttle":           65,
                    "airspeed":           round(airspeed, 2),
                    "groundspeed":        round(airspeed, 2),
                    "vx":                 round(demo_data["vx"], 2),
                    "vy":                 round(demo_data["vy"], 2),
                    "vz":                 round(demo_data["vz"], 2),
                    "lat":                lat,
                    "lon":                lon,
                    "battery_voltage":    demo_data["voltage"],
                    "battery_current":    demo_data["current"],
                    "battery_remaining":  demo_data["battery_pct"],
                    "gps_fix":            "3D Fix",
                    "satellites":         sats,
                    "hdop":               0.9,
                    "ekf_ok":             True,
                    "last_statustext":    "",
                    "rpi_lat":            lat,
                    "rpi_lon":            lon,
                    "rpi_alt":            round(alt_m, 2),
                    "rpi_speed":          round(airspeed, 2),
                    "rpi_fix":            "3D Fix",
                    "rpi_satellites":     sats,
                    "frame_b64":          frame_b64,
                    "gps_source":         "DEMO",
                    "server_ts":          round(time.time(), 3),
                }

                # Run flood inference on the demo frame (same pipeline)
                asyncio.ensure_future(_run_ml_inference(frame_b64))

                with _ml_lock:
                    ml = dict(_ml_result) if _ml_result else {}

                payload["flood_mask_b64"]     = ml.get("mask_b64", None)
                payload["flood_coverage"]     = ml.get("coverage_pct", None)
                payload["inference_ms"]       = ml.get("inference_ms", None)
                payload["rescue_path_pixels"] = ml.get("rescue_path_pixels", None)
                payload["flood_heatmap_b64"]  = ml.get("flood_heatmap_b64", None)
                payload["flood_centroids"]    = ml.get("flood_centroids", None)

            # ── Live branch (unchanged) ───────────────────────────────
            else:
                mavlink_state = reader.get_state()
                with _rpi_lock:
                    rpi_snapshot = dict(_rpi_state)

                # Merge: MAVLink telemetry + RPi GPS/frame
                # RPi GPS takes priority if fix > 0, else fall back to MAVLink GPS
                rpi_fix = rpi_snapshot.get("fix", 0)
                payload = {
                    # MAVLink fields
                    **mavlink_state,
                    # RPi overlay
                    "rpi_lat":        rpi_snapshot["lat"],
                    "rpi_lon":        rpi_snapshot["lon"],
                    "rpi_alt":        rpi_snapshot["alt"],
                    "rpi_speed":      rpi_snapshot["speed"],
                    "rpi_fix":        rpi_fix,
                    "rpi_satellites": rpi_snapshot["satellites"],
                    "frame_b64":      rpi_snapshot["frame_b64"],
                    # Which GPS source is active
                    "gps_source":     "rpi" if rpi_fix >= 2 else "mavlink",
                    "server_ts":      round(time.time(), 3),
                }

                frame_b64 = rpi_snapshot.get("frame_b64")
                if frame_b64 is not None:
                    asyncio.ensure_future(_run_ml_inference(frame_b64))

                with _ml_lock:
                    ml = dict(_ml_result) if _ml_result else {}

                payload["flood_mask_b64"]    = ml.get("mask_b64", None)
                payload["flood_coverage"]    = ml.get("coverage_pct", None)
                payload["inference_ms"]      = ml.get("inference_ms", None)
                payload["rescue_path_pixels"] = ml.get("rescue_path_pixels", None)
                payload["flood_heatmap_b64"] = ml.get("flood_heatmap_b64", None)
                payload["flood_centroids"]   = ml.get("flood_centroids", None)

            await ws.send_json(payload)
            await asyncio.sleep(0.1)   # 10Hz
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected.")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
