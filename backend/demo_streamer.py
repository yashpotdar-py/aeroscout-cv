"""
demo_streamer.py
----------------
Replays a pre-recorded aerial video + Airdata flight-log CSV as if it were
a live drone feed.  Used by main.py in Demo Mode.

Usage:
    streamer = DemoStreamer("path/to/video.mp4", "path/to/log.csv")
    data = streamer.next_frame()   # dict with frame_bgr, lat, lon, …
    streamer.release()
"""

import logging
import cv2
import pandas as pd

logger = logging.getLogger(__name__)

# ── Unit-conversion helpers ───────────────────────────────────────────────────

_FEET_TO_METRES = 0.3048
_MPH_TO_MPS = 0.44704


def _safe_float(val, default: float = 0.0) -> float:
    """Parse a value to float, returning *default* for non-numeric strings."""
    try:
        return float(val)
    except (ValueError, TypeError):
        return default


class DemoStreamer:
    """Loops a video + CSV flight log, yielding one frame dict per call."""

    def __init__(self, video_path: str, csv_path: str) -> None:
        # ── Video ─────────────────────────────────────────────────────────
        self._cap = cv2.VideoCapture(video_path)
        if not self._cap.isOpened():
            raise FileNotFoundError(
                f"DemoStreamer: cannot open video file '{video_path}'"
            )

        self._total_frames = int(self._cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if self._total_frames <= 0:
            raise FileNotFoundError(
                f"DemoStreamer: video '{video_path}' has 0 frames"
            )

        self.fps = self._cap.get(cv2.CAP_PROP_FPS) or 30.0
        self.frame_step = max(1, round(self.fps / 10))

        # ── CSV ───────────────────────────────────────────────────────────
        try:
            df = pd.read_csv(csv_path, skipinitialspace=True)
        except FileNotFoundError:
            raise FileNotFoundError(
                f"DemoStreamer: cannot open CSV file '{csv_path}'"
            )

        # Filter to video-only rows if the column exists
        if "isVideo" in df.columns:
            df_filtered = df[df["isVideo"] == 1]
            if not df_filtered.empty:
                df = df_filtered

        df = df.reset_index(drop=True)
        self._csv = df
        self._csv_len = len(df)

        if self._csv_len == 0:
            raise FileNotFoundError(
                f"DemoStreamer: CSV '{csv_path}' produced 0 usable rows"
            )

        # ── Index tracking ────────────────────────────────────────────────
        self._frame_idx = 0

        logger.info(
            f"DemoStreamer ready — {self._total_frames} video frames, "
            f"{self._csv_len} CSV rows, "
            f"fps={self.fps:.4g}, frame_step={self.frame_step}"
        )

    # ──────────────────────────────────────────────────────────────────────────
    # Public API
    # ──────────────────────────────────────────────────────────────────────────

    def next_frame(self) -> dict:
        """Return the next frame + telemetry dict. Auto-loops on exhaustion."""
        ok, frame_bgr = self._cap.read()
        if not ok:
            # Seek back to beginning
            self._cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            self._frame_idx = 0
            ok, frame_bgr = self._cap.read()
            if not ok:
                raise RuntimeError("DemoStreamer: cannot read frame after loop")

        # Map current video time → CSV row index at 10 Hz (with wraparound)
        csv_idx = int(self._frame_idx / self.fps * 10) % self._csv_len
        row = self._csv.iloc[csv_idx]

        self._frame_idx += self.frame_step

        # Sum individual cell voltages for total pack voltage
        voltage = sum(
            _safe_float(row.get(f"voltageCell{i}", 0))
            for i in range(1, 7)
        )

        return {
            "frame_bgr":      frame_bgr,
            "lat":            _safe_float(row.get("latitude")),
            "lon":            _safe_float(row.get("longitude")),
            "alt_m":          _safe_float(row.get("altitude(feet)")) * _FEET_TO_METRES,
            "heading":        _safe_float(row.get("compass_heading(degrees)")),
            "airspeed_mps":   _safe_float(row.get("speed(mph)")) * _MPH_TO_MPS,
            "satellites":     int(_safe_float(row.get("satellites", 0))),
            # ── Enhanced telemetry ──
            "battery_pct":    _safe_float(row.get("battery_percent")),
            "voltage":        round(voltage, 3),
            "current":        _safe_float(row.get("current(A)")),
            "pitch":          _safe_float(row.get("pitch(degrees)")),
            "roll":           _safe_float(row.get("roll(degrees)")),
            "gimbal_pitch":   _safe_float(row.get("gimbal_pitch(degrees)")),
            "vx":             _safe_float(row.get("xSpeed(mph)")) * _MPH_TO_MPS,
            "vy":             _safe_float(row.get("ySpeed(mph)")) * _MPH_TO_MPS,
            "vz":             _safe_float(row.get("zSpeed(mph)")) * _MPH_TO_MPS,
            "fly_state":      str(row.get("flycState", "P-GPS")),
        }

    def release(self) -> None:
        """Release the underlying VideoCapture."""
        if self._cap is not None:
            self._cap.release()
            self._cap = None
            logger.info("DemoStreamer: released video capture.")
