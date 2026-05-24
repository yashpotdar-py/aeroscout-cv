# AeroScout-CV — Demo Mode

Demo Mode allows anyone to run the full AeroScout GCS experience — live telemetry, video feed, flood segmentation, rescue path planning — **without any drone hardware**.

---

## How It Works

Demo Mode replaces the live hardware pipeline with two pre-recorded assets:

| Asset | File | Description |
|---|---|---|
| Aerial video | `backend/demo_data/aerial_floodv1.mp4` | Pre-recorded flood survey footage |
| Flight log | `backend/demo_data/flight_log2.csv` | Airdata exported flight telemetry CSV |

The `DemoStreamer` class in `backend/demo_streamer.py` synchronizes playback so that video frames and CSV rows advance together at 10 Hz — exactly mimicking a live feed.

---

## Activation

### Via the UI (Recommended)

1. Start AeroScout (Docker Compose or manual)
2. Navigate to **Command Center** (`/command`)
3. Click the **`DEMO`** floating button (bottom-right corner)
4. Demo mode activates — the status bar shows `GPS: DEMO` and the video feed starts

Click **`DEMO`** again to return to live mode.

### Via API

```bash
# Start demo
curl -X POST http://localhost:8000/demo/start

# Stop demo (return to live)
curl -X POST http://localhost:8000/demo/stop

# Check status
curl http://localhost:8000/demo/status
```

---

## DemoStreamer Internals

```python
class DemoStreamer:
    """Loops a video + CSV flight log, yielding one frame dict per call."""
```

### Video Playback

- Opens `aerial_floodv1.mp4` with OpenCV `VideoCapture`
- Reads frames at the video's native FPS
- **Auto-loops**: when the video ends, seeks back to frame 0 and continues
- `frame_step`: advances by `round(fps / 10)` frames per WebSocket tick to maintain 10 Hz output regardless of source FPS

### CSV Synchronization

The CSV is an Airdata export with per-frame telemetry rows. The streamer maps:

```
csv_idx = int(frame_index / video_fps * 10) % csv_len
```

This maps the current video time (in seconds) to a CSV row index at 10 Hz, synchronized with the WebSocket broadcast rate. Both loop independently but are keyed to the same frame counter.

### Unit Conversions Applied

| CSV Column | Unit | Converted To |
|---|---|---|
| `altitude(feet)` | feet | metres × 0.3048 |
| `speed(mph)` | mph | m/s × 0.44704 |
| `xSpeed(mph)`, `ySpeed(mph)`, `zSpeed(mph)` | mph | m/s × 0.44704 |
| `voltageCell1`–`voltageCell6` | volts per cell | summed to pack voltage |

### Frame Encoding

Each video frame is:
1. Read from OpenCV as BGR
2. Converted to RGB via `cv2.cvtColor`
3. Encoded as JPEG (quality 85) via Pillow
4. Base64-encoded to a UTF-8 string
5. Included as `frame_b64` in the WebSocket payload

The same frame then goes through the **full ML inference pipeline** — flood segmentation, heatmap generation, A* path planning — producing real inference results on the demo footage.

---

## Flight Log CSV Format

The `flight_log2.csv` is an **Airdata** export. Key columns used by `DemoStreamer`:

| Column | Description |
|---|---|
| `latitude`, `longitude` | GPS coordinates |
| `altitude(feet)` | Barometric altitude |
| `compass_heading(degrees)` | Yaw heading |
| `speed(mph)` | Ground speed |
| `satellites` | GPS satellite count |
| `battery_percent` | Battery state of charge |
| `current(A)` | Current draw |
| `pitch(degrees)`, `roll(degrees)` | Attitude angles |
| `xSpeed(mph)`, `ySpeed(mph)`, `zSpeed(mph)` | Velocity components |
| `flycState` | Flight controller state string (e.g. `"P-GPS"`) |
| `voltageCell1` – `voltageCell6` | Individual LiPo cell voltages |
| `isVideo` | If present, rows with value `1` are filtered to video-only timestamps |

---

## Adding Your Own Demo Data

To replace the demo data with your own footage:

1. Record an aerial video (MP4 format, any resolution)
2. Export an Airdata flight log CSV from the same flight
3. Place files in `backend/demo_data/`
4. Update `main.py` lines 170–175 to point to your new files:
   ```python
   demo_streamer = DemoStreamer(
       video_path=str(_base / "your_video.mp4"),
       csv_path=str(_base / "your_log.csv"),
   )
   ```

> **Note:** The large `aerial_flood.mp4` (2.91 GB) is excluded from the repository. Only `aerial_floodv1.mp4` (41 MB) is tracked via Git LFS and included.
