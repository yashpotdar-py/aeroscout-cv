# AeroScout-CV — API Reference

**Base URL (local):** `http://localhost:8000`  
**Interactive Docs:** `http://localhost:8000/docs` (Swagger UI)  
**WebSocket:** `ws://localhost:8000/ws`

---

## REST Endpoints

### `GET /health`

Returns service health status including MAVLink and RPi connection state.

**Response `200 OK`:**
```json
{
  "status": "ok",
  "mavlink_connected": true,
  "mode": "GUIDED",
  "armed": false,
  "rpi_connected": true
}
```

| Field | Type | Description |
|---|---|---|
| `status` | `string` | Always `"ok"` if server is running |
| `mavlink_connected` | `boolean` | Whether a MAVLink heartbeat was received |
| `mode` | `string` | Current flight mode (e.g. `"STABILIZE"`, `"GUIDED"`, `"AUTO"`) |
| `armed` | `boolean` | Whether the flight controller is armed |
| `rpi_connected` | `boolean` | Whether RPi data was received within the last 5 seconds |

---

### `POST /rpi/data`

Receives GPS telemetry and an optional camera frame from the Raspberry Pi onboard sender.

**Request Body (`application/json`):**
```json
{
  "ts": 1716550000.123,
  "gps": {
    "lat": 18.5204,
    "lon": 73.8567,
    "alt": 42.5,
    "speed": 8.3,
    "fix": 3,
    "satellites": 14
  },
  "frame_b64": "<base64-encoded JPEG string or null>",
  "source": "rpi"
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `ts` | `float` | ✅ | Unix timestamp of the reading |
| `gps.lat` | `float \| null` | ❌ | Latitude in decimal degrees |
| `gps.lon` | `float \| null` | ❌ | Longitude in decimal degrees |
| `gps.alt` | `float \| null` | ❌ | Altitude in metres |
| `gps.speed` | `float \| null` | ❌ | Ground speed in m/s |
| `gps.fix` | `int` | ❌ | GPS fix type: `0`=No Fix, `2`=2D, `3`=3D |
| `gps.satellites` | `int` | ❌ | Number of satellites in view |
| `frame_b64` | `string \| null` | ❌ | Base64-encoded JPEG frame from camera |
| `source` | `string` | ❌ | Sender identifier (default: `"rpi"`) |

**Response `200 OK`:**
```json
{ "status": "ok" }
```

---

### `POST /demo/start`

Activates **Demo Mode**. The WebSocket will begin streaming data from the pre-recorded video + CSV instead of live hardware. Runs `aerial_floodv1.mp4` + `flight_log2.csv` in a loop.

**Request Body:** None

**Response `200 OK`:**
```json
{ "status": "demo_active" }
```

---

### `POST /demo/stop`

Deactivates Demo Mode. Reverts the WebSocket to streaming live MAVLink + RPi data.

**Request Body:** None

**Response `200 OK`:**
```json
{ "status": "live_active" }
```

---

### `GET /demo/status`

Returns the current demo mode state.

**Response `200 OK`:**
```json
{ "active": false }
```

---

## WebSocket `/ws`

A persistent WebSocket connection that broadcasts a JSON payload at **10 Hz** (every 100ms).

**Connection:** `ws://localhost:8000/ws`

### Full Payload Schema

```json
{
  // ── MAVLink Telemetry ──────────────────────────────────────────────────────
  "connected":          true,
  "armed":              false,
  "mode":               "GUIDED",

  "roll":               1.24,
  "pitch":              -0.31,
  "yaw":                182.5,
  "heading":            182,
  "throttle":           65,

  "airspeed":           8.3,
  "groundspeed":        8.1,
  "altitude":           42.5,
  "alt_msl":            442.5,
  "alt_rel":            42.5,

  "vx":                 7.2,
  "vy":                 -1.1,
  "vz":                 0.04,

  "lat":                18.5204,
  "lon":                73.8567,

  "battery_voltage":    15.8,
  "battery_current":    14.2,
  "battery_remaining":  72,

  "gps_fix":            "3D Fix",
  "satellites":         14,
  "hdop":               0.9,
  "ekf_ok":             true,
  "last_statustext":    "",

  // ── RPi Overlay ────────────────────────────────────────────────────────────
  "rpi_lat":            18.5204,
  "rpi_lon":            73.8567,
  "rpi_alt":            42.5,
  "rpi_speed":          8.3,
  "rpi_fix":            "3D Fix",
  "rpi_satellites":     14,

  // ── Camera ─────────────────────────────────────────────────────────────────
  "frame_b64":          "<base64-encoded JPEG string or null>",

  // ── ML Inference Results ───────────────────────────────────────────────────
  "flood_mask_b64":     "<base64-encoded PNG RGBA mask or null>",
  "flood_heatmap_b64":  "<base64-encoded PNG RGBA heatmap or null>",
  "flood_coverage":     12.4,
  "inference_ms":       187,
  "rescue_path_pixels": [[128, 128], [120, 130], [115, 145]],
  "flood_centroids":    [[90.5, 130.2], [200.1, 88.7]],

  // ── Metadata ───────────────────────────────────────────────────────────────
  "gps_source":         "rpi",
  "server_ts":          1716550000.123
}
```

### Field Reference

| Field | Type | Description |
|---|---|---|
| `connected` | `boolean` | MAVLink link is active |
| `armed` | `boolean` | Drone is armed |
| `mode` | `string` | Current flight mode |
| `roll`, `pitch`, `yaw` | `float` | Euler angles in degrees |
| `heading` | `int` | Compass heading (0–359°) |
| `throttle` | `int` | Throttle percentage (0–100) |
| `airspeed` | `float` | Airspeed in m/s |
| `groundspeed` | `float` | Ground speed in m/s |
| `altitude` | `float` | Altitude from VFR_HUD in metres |
| `alt_msl` | `float` | Altitude above mean sea level (metres) |
| `alt_rel` | `float` | Altitude above home/takeoff point (metres) |
| `vx`, `vy`, `vz` | `float` | Velocity components in m/s |
| `lat`, `lon` | `float` | MAVLink GPS coordinates |
| `battery_voltage` | `float` | Pack voltage in volts |
| `battery_current` | `float` | Current draw in amps |
| `battery_remaining` | `int` | Battery percentage (-1 if unknown) |
| `gps_fix` | `string` | GPS fix quality string |
| `satellites` | `int` | GPS satellite count |
| `hdop` | `float` | Horizontal dilution of precision |
| `ekf_ok` | `boolean` | EKF health flag |
| `last_statustext` | `string` | Last MAVLink STATUSTEXT message |
| `rpi_lat`, `rpi_lon` | `float \| null` | RPi GPS coordinates |
| `rpi_alt` | `float \| null` | RPi altitude |
| `rpi_speed` | `float \| null` | RPi ground speed |
| `rpi_fix` | `string \| int` | RPi GPS fix type |
| `rpi_satellites` | `int` | RPi satellite count |
| `frame_b64` | `string \| null` | Raw camera frame (JPEG, base64) |
| `flood_mask_b64` | `string \| null` | Binary flood mask (PNG RGBA, base64) |
| `flood_heatmap_b64` | `string \| null` | Confidence heatmap (PNG RGBA, base64) |
| `flood_coverage` | `float \| null` | % of frame classified as flood |
| `inference_ms` | `int \| null` | Inference wall-clock time in ms |
| `rescue_path_pixels` | `[[int,int]] \| null` | A* path waypoints in 256×256 pixel space |
| `flood_centroids` | `[[float,float]] \| null` | Flood cluster centers in 256×256 pixel space |
| `gps_source` | `string` | Active GPS source: `"rpi"`, `"mavlink"`, or `"DEMO"` |
| `server_ts` | `float` | Server Unix timestamp of the frame |

---

## Error Handling

The WebSocket will disconnect if an unhandled exception occurs. The frontend's `useWebSocket` hook implements automatic reconnection with exponential backoff.

HTTP endpoints return standard FastAPI error responses:
- `422 Unprocessable Entity` — request body validation failure (Pydantic)
- `500 Internal Server Error` — unexpected server error
