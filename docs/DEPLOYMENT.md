# AeroScout-CV — Deployment Guide

## Table of Contents

- [Prerequisites](#prerequisites)
- [Option A: Docker Compose (Recommended)](#option-a-docker-compose-recommended)
- [Option B: Manual Setup](#option-b-manual-setup)
- [MAVLink Configuration](#mavlink-configuration)
- [Raspberry Pi Sender Setup](#raspberry-pi-sender-setup)
- [ML Model Weight Setup](#ml-model-weight-setup)
- [Environment Variables Reference](#environment-variables-reference)

---

## Prerequisites

| Tool | Minimum Version | Purpose |
|---|---|---|
| [Git](https://git-scm.com) | 2.40+ | Version control |
| [Git LFS](https://git-lfs.github.com) | 3.x | Large file support (demo video) |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | 4.x | Container runtime |
| [Python](https://python.org) | 3.11+ | Backend (manual setup only) |
| [Node.js](https://nodejs.org) | 20 LTS+ | Frontend (manual setup only) |

---

## Option A: Docker Compose (Recommended)

This method starts both the backend and frontend in containers with a single command.

### 1. Clone & Pull LFS Assets

```bash
git clone https://github.com/yashpotdar-py/aeroscout-cv.git
cd aeroscout-cv

# Pull Git LFS tracked files (demo video + flight log)
git lfs pull
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` for your setup:

```bash
# If you have the ML model weights:
MODEL_PATH=models/flood_unet.pth

# If connecting to Mission Planner via UDP (default):
MAVLINK_CONNECTION=udpin:0.0.0.0:14550

# If using direct serial on Linux:
# MAVLINK_CONNECTION=/dev/ttyUSB0
```

### 3. Start Services

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend (GCS Dashboard) | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Swagger Docs | http://localhost:8000/docs |

### 4. Stop Services

```bash
docker compose down
```

---

## Option B: Manual Setup

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv

# Windows:
.venv\Scripts\activate

# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env as needed

# Start backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

---

## MAVLink Configuration

AeroScout connects to a MAVLink stream from a Pixhawk or ArduPilot flight controller.

### Via Mission Planner (UDP Forward — Recommended for Windows)

1. Connect your Pixhawk to Mission Planner
2. In Mission Planner: **Config → Planner → Enable UDP Output**  
   - Host: `127.0.0.1`  
   - Port: `14550`
3. AeroScout will automatically pick up the stream on `udpin:0.0.0.0:14550`

### Via Direct Serial (USB/COM)

Set `MAVLINK_CONNECTION` in your `.env`:

```bash
# Windows
MAVLINK_CONNECTION=COM3

# Linux
MAVLINK_CONNECTION=/dev/ttyUSB0
```

Ensure the baud rate matches your flight controller (typically 115200).

### No Hardware? Use Demo Mode

If you don't have a drone, use **Demo Mode** — no MAVLink required. See [`DEMO_MODE.md`](DEMO_MODE.md).

---

## Raspberry Pi Sender Setup

The RPi acts as an onboard camera + GPS forwarder. A sender script (not included in this repo) should POST to the backend's `/rpi/data` endpoint.

**Example sender payload:**
```python
import requests
import base64
import time

# Capture a frame from the camera
frame_b64 = base64.b64encode(jpeg_bytes).decode()

payload = {
    "ts": time.time(),
    "gps": {
        "lat": 18.5204,
        "lon": 73.8567,
        "alt": 42.5,
        "speed": 8.3,
        "fix": 3,
        "satellites": 14,
    },
    "frame_b64": frame_b64,
    "source": "rpi",
}

requests.post("http://<ground-station-ip>:8000/rpi/data", json=payload)
```

The backend accepts frames at any rate; it will throttle ML inference to 1 call per 1.5 seconds automatically.

---

## ML Model Weight Setup

The flood segmentation model (`flood_unet.pth`) is **not included** in the repository due to file size.

To enable ML inference:

1. Obtain `flood_unet.pth` from the training pipeline (see the [FloodNav paper](https://github.com/yashpotdar-py))
2. Place it in `backend/models/flood_unet.pth`
3. Set `MODEL_PATH=models/flood_unet.pth` in your `.env`
4. Restart the backend

**Without the model**, AeroScout will operate normally — flood mask, heatmap, and rescue path fields will simply be `null` in the WebSocket payload. Demo Mode still works fully.

---

## Environment Variables Reference

| Variable | Default | Description |
|---|---|---|
| `MODEL_PATH` | `models/flood_unet.pth` | Path to LNN U-Net model weights |
| `MAVLINK_CONNECTION` | `udpin:0.0.0.0:14550` | pymavlink connection string |
| `LOG_LEVEL` | `info` | Uvicorn log level |
| `VITE_BACKEND_WS_URL` | `ws://localhost:8000/ws` | WebSocket URL (used by frontend in Docker) |
| `VITE_BACKEND_HTTP_URL` | `http://localhost:8000` | HTTP URL for REST calls (frontend in Docker) |
