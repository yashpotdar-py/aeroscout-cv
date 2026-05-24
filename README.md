<div align="center">

<img src="docs/assets/aeroscout_banner.png" alt="AeroScout Banner" width="100%" />

# AeroScout-CV

**Real-time disaster intelligence at the edge.**  
Autonomous UAV platform with edge-computed flood segmentation, rescue path planning, and a live Ground Control Station.

[![CI](https://github.com/yashpotdar-py/aeroscout-cv/actions/workflows/ci.yml/badge.svg)](https://github.com/yashpotdar-py/aeroscout-cv/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![Git LFS](https://img.shields.io/badge/Git-LFS-F05032?logo=git&logoColor=white)](https://git-lfs.github.com)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
  - [Docker Compose (Recommended)](#docker-compose-recommended)
  - [Manual Setup](#manual-setup)
- [Demo Mode](#demo-mode)
- [API Reference](#api-reference)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

AeroScout-CV is a full-stack autonomous UAV ground control system built for real-time disaster response. It combines:

- **Liquid Neural Networks** (LNN) for temporally-aware flood segmentation — running entirely on a Raspberry Pi 3 at **5.2 fps**, **14.8×** more parameter-efficient than standard U-Net
- **PPO Reinforcement Learning** path planner that dynamically re-routes the UAV to maximize disaster zone coverage (**91.2% area surveyed**, **17.9% energy reduction**)
- **A\* rescue path planning** layered over real-time flood probability maps
- **MAVLink telemetry** integration (ArduPilot/PX4 via Mission Planner or direct COM)
- **Live GCS dashboard** — streaming video, telemetry HUD, interactive Leaflet map, mission log

All inference happens **on the drone** — zero cloud dependency.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      DRONE (Edge)                       │
│  ┌──────────────┐   ┌──────────────────────────────┐   │
│  │  Pixhawk FCU │   │     Raspberry Pi 3            │   │
│  │  (ArduPilot) │   │  ┌──────────┐  ┌──────────┐  │   │
│  │  MAVLink UDP │   │  │ Camera   │  │ FloodNav │  │   │
│  └──────┬───────┘   │  │ Capture  │→ │ LNN Model│  │   │
│         │           │  └──────────┘  └────┬─────┘  │   │
│         │           │                     │ HTTP    │   │
└─────────┼───────────┼─────────────────────┼─────────┘
          │ UDP:14550 │                     │ /rpi/data
          ▼           └─────────────────────┼──────────
┌──────────────────────────────────────────────────────┐
│                   GROUND STATION                      │
│  ┌─────────────────────────────────────────────────┐ │
│  │           FastAPI Backend (:8000)               │ │
│  │  ┌─────────────┐  ┌──────────┐  ┌───────────┐  │ │
│  │  │ MAVLinkReader│  │ Flood    │  │ Path      │  │ │
│  │  │ (10Hz thread)│  │ Inference│  │ Planner   │  │ │
│  │  └──────┬───────┘  └────┬─────┘  └─────┬─────┘  │ │
│  │         └───────────────┴──────────────┘         │ │
│  │                    WebSocket /ws                  │ │
│  └──────────────────────┬──────────────────────────┘ │
│                         │ WS                          │
│  ┌──────────────────────▼──────────────────────────┐ │
│  │         React Frontend (:5173)                  │ │
│  │  Telemetry HUD │ Leaflet Map │ Video Feed │ Log  │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

> See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full data-flow specification.

---

## Key Features

| Feature | Details |
|---|---|
| 🧠 **Flood Segmentation** | LNN U-Net hybrid, 2.14M params, 91.0% pixel accuracy (FloodNet) |
| 🗺️ **Live Map** | Leaflet.js with real-time drone position, flood centroid markers, A* rescue path overlay |
| 📡 **MAVLink Integration** | Connects to ArduPilot/PX4 via UDP (Mission Planner forward) or direct serial (COM3) |
| 🎥 **Video Feed** | JPEG-over-WebSocket from RPi camera; flood mask + heatmap overlay rendered client-side |
| 🎮 **Demo Mode** | Full simulation from pre-recorded aerial video + Airdata flight log CSV — no hardware needed |
| 🔋 **Telemetry HUD** | Battery, GPS fix, altitude, heading, speed, EKF status, armed state |
| 🚁 **Rescue Routing** | A* path from drone position to nearest safe zone, overlaid on map in real-time |
| ⚡ **10 Hz WebSocket** | All telemetry, video, and ML results streamed at 10 Hz |

---

## Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com) + [Uvicorn](https://www.uvicorn.org)
- [pymavlink](https://github.com/ArduPilot/pymavlink) — MAVLink protocol
- [OpenCV](https://opencv.org) + [Pillow](https://python-pillow.org) — frame processing
- [NumPy](https://numpy.org) + [SciPy](https://scipy.org) — flood map analysis
- [pandas](https://pandas.pydata.org) — CSV flight log replay

**Frontend**
- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite 8](https://vitejs.dev) — build tooling
- [TailwindCSS 3](https://tailwindcss.com) — styling
- [Framer Motion](https://www.framer.com/motion/) — animations
- [Leaflet.js](https://leafletjs.com) + [react-leaflet](https://react-leaflet.js.org) — maps
- [Lucide React](https://lucide.dev) — icons

**Infrastructure**
- [Docker](https://docker.com) + Docker Compose — container orchestration
- [Git LFS](https://git-lfs.github.com) — large file storage (video assets)
- [GitHub Actions](https://github.com/features/actions) — CI/CD

---

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 4.x
- [Git LFS](https://git-lfs.github.com/) (required if you want demo video assets)

### Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/yashpotdar-py/aeroscout-cv.git
cd aeroscout-cv

# 2. Pull LFS objects (demo video + flight log)
git lfs pull

# 3. Copy environment file and configure
cp .env.example .env
# Edit .env if you have an ML model weight file
# MODEL_PATH defaults to models/flood_unet.pth (optional)

# 4. Start both services
docker compose up --build

# Frontend → http://localhost:5173
# Backend  → http://localhost:8000
# API Docs → http://localhost:8000/docs
```

> **Demo Mode**: No drone hardware required. Click the **DEMO** toggle in the Command Center to replay the pre-recorded aerial flood mission.

### Manual Setup

<details>
<summary><b>Backend (Python 3.11+)</b></summary>

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate        # Linux/macOS
.venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Install local floodnav package
pip install -e ./floodnav         # if available as a package
# or it's imported directly from the backend/ directory

# Configure environment
cp .env.example .env
# Edit MODEL_PATH if you have flood_unet.pth

# Run
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

</details>

<details>
<summary><b>Frontend (Node 20+)</b></summary>

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:5173
```

</details>

---

## Demo Mode

AeroScout ships with a built-in **Demo Mode** that replays a pre-recorded aerial flood survey — no drone, no MAVLink connection needed.

1. Start the backend and frontend (see Quick Start)
2. Navigate to **Command Center** → click the **`DEMO`** toggle (bottom-right)
3. The system replays `aerial_floodv1.mp4` synchronized with `flight_log2.csv`, running the full ML inference pipeline live

> See [`docs/DEMO_MODE.md`](docs/DEMO_MODE.md) for technical details on the replay system.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health + MAVLink/RPi connection status |
| `POST` | `/rpi/data` | Receive GPS + camera frame from Raspberry Pi sender |
| `POST` | `/demo/start` | Activate demo mode (video + CSV replay) |
| `POST` | `/demo/stop` | Return to live MAVLink feed |
| `GET` | `/demo/status` | Check demo mode state |
| `WS` | `/ws` | 10 Hz telemetry + video + ML results stream |
| `GET` | `/docs` | Interactive Swagger UI |

> Full payload schemas and examples: [`docs/API.md`](docs/API.md)

---

## Documentation

| Document | Description |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System design, data-flow diagrams, component responsibilities |
| [`docs/API.md`](docs/API.md) | Full REST + WebSocket API reference with payload schemas |
| [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) | Docker, manual setup, RPi sender, MAVLink configuration |
| [`docs/DEMO_MODE.md`](docs/DEMO_MODE.md) | Demo replay system internals |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | How to contribute — branch strategy, code style, PR process |
| [`SECURITY.md`](SECURITY.md) | Security policy and vulnerability reporting |

---

## Contributing

We welcome contributions! Please read [`CONTRIBUTING.md`](CONTRIBUTING.md) before opening a PR.

**Quick workflow:**
```
Fork → Feature Branch → PR → Review → Merge
```

---

## License

This project is licensed under the **MIT License** — see [`LICENSE`](LICENSE) for details.

---

<div align="center">

Built by [Yash Potdar](https://github.com/yashpotdar-py) · AeroScout Systems · 2026

</div>
