"""
mavlink_reader.py
-----------------
Connects to MAVLink stream (UDP from Mission Planner or direct COM3).
Runs a background daemon thread — continuously reads messages and
updates a shared state dict. Thread-safe via Lock.

Usage:
    reader = MAVLinkReader()
    reader.start()
    state = reader.get_state()   # call anytime from any thread
    reader.stop()
"""

import threading
import time
import logging
from pymavlink import mavutil

logger = logging.getLogger(__name__)

# Default connection — MP UDP forwarding
DEFAULT_CONNECTION = "udpin:0.0.0.0:14550"

# Fallback if UDP fails
FALLBACK_CONNECTION = "COM3"
FALLBACK_BAUD = 115200


class MAVLinkReader:
    def __init__(self, connection_str: str = DEFAULT_CONNECTION):
        self.connection_str = connection_str
        self._state: dict = self._empty_state()
        self._lock = threading.Lock()
        self._running = False
        self._thread: threading.Thread | None = None
        self._master = None
        self.connected = False

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def start(self):
        """Start background reader thread. Returns immediately."""
        self._running = True
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()
        logger.info(f"MAVLinkReader started on {self.connection_str}")

    def stop(self):
        """Signal thread to stop."""
        self._running = False

    def get_state(self) -> dict:
        """Thread-safe snapshot of latest telemetry."""
        with self._lock:
            return dict(self._state)

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    def _run(self):
        """Main reader loop — runs in background thread."""
        # Attempt connection with retry
        while self._running:
            try:
                logger.info(f"Connecting to {self.connection_str}...")
                self._master = mavutil.mavlink_connection(self.connection_str)
                hb = self._master.wait_heartbeat(timeout=8)
                if hb is None:
                    logger.warning("Heartbeat timeout. Retrying in 3s...")
                    time.sleep(3)
                    continue
                self.connected = True
                logger.info(
                    f"Connected. System: {self._master.target_system}, "
                    f"Component: {self._master.target_component}"
                )
                # Request all data streams at 10 Hz
                self._master.mav.request_data_stream_send(
                    self._master.target_system,
                    self._master.target_component,
                    mavutil.mavlink.MAV_DATA_STREAM_ALL,
                    10,
                    1,
                )
                self._read_loop()
            except Exception as e:
                logger.error(f"MAVLink connection error: {e}")
                self.connected = False
                time.sleep(3)

    def _read_loop(self):
        """Inner loop — parse messages and update state."""
        while self._running:
            try:
                msg = self._master.recv_match(blocking=True, timeout=1.0)
                if msg is None:
                    continue
                self._handle(msg)
            except Exception as e:
                logger.error(f"Read error: {e}")
                self.connected = False
                break  # Outer loop will reconnect

    def _handle(self, msg):
        """Parse one MAVLink message and update shared state."""
        t = msg.get_type()

        with self._lock:
            self._state["last_msg_ts"] = time.time()

            if t == "HEARTBEAT":
                self._state["mode"] = mavutil.mode_string_v10(msg)
                self._state["armed"] = bool(
                    msg.base_mode & mavutil.mavlink.MAV_MODE_FLAG_SAFETY_ARMED
                )
                self._state["connected"] = True

            elif t == "ATTITUDE":
                import math

                self._state["roll"] = round(math.degrees(msg.roll), 2)
                self._state["pitch"] = round(math.degrees(msg.pitch), 2)
                self._state["yaw"] = round(math.degrees(msg.yaw), 2)

            elif t == "VFR_HUD":
                self._state["airspeed"] = round(msg.airspeed, 2)
                self._state["groundspeed"] = round(msg.groundspeed, 2)
                self._state["altitude"] = round(msg.alt, 2)
                self._state["heading"] = msg.heading
                self._state["throttle"] = msg.throttle

            elif t == "GLOBAL_POSITION_INT":
                self._state["lat"] = round(msg.lat / 1e7, 7)
                self._state["lon"] = round(msg.lon / 1e7, 7)
                self._state["alt_msl"] = round(msg.alt / 1000.0, 2)
                self._state["alt_rel"] = round(msg.relative_alt / 1000.0, 2)
                self._state["vx"] = round(msg.vx / 100.0, 2)
                self._state["vy"] = round(msg.vy / 100.0, 2)
                self._state["vz"] = round(msg.vz / 100.0, 2)

            elif t == "SYS_STATUS":
                self._state["battery_voltage"] = round(msg.voltage_battery / 1000.0, 2)
                self._state["battery_current"] = round(msg.current_battery / 100.0, 2)
                self._state["battery_remaining"] = msg.battery_remaining

            elif t == "BATTERY_STATUS":
                # More accurate battery — use if available
                if msg.voltages and msg.voltages[0] != 65535:
                    self._state["battery_voltage"] = round(msg.voltages[0] / 1000.0, 2)

            elif t == "GPS_RAW_INT":
                fix_map = {
                    0: "No Fix",
                    1: "No Fix",
                    2: "2D",
                    3: "3D",
                    4: "DGPS",
                    5: "RTK Float",
                    6: "RTK Fixed",
                }
                self._state["gps_fix"] = fix_map.get(msg.fix_type, "Unknown")
                self._state["satellites"] = msg.satellites_visible
                self._state["hdop"] = (
                    round(msg.eph / 100.0, 2) if msg.eph != 65535 else 99.0
                )

            elif t == "EKF_STATUS_REPORT":
                self._state["ekf_ok"] = bool(msg.flags & 0x1F == 0x1F)

            elif t == "STATUSTEXT":
                self._state["last_statustext"] = msg.text.strip()
                logger.info(f"[FCU] {msg.text.strip()}")

    @staticmethod
    def _empty_state() -> dict:
        return {
            "connected": False,
            "armed": False,
            "mode": "UNKNOWN",
            "roll": 0.0,
            "pitch": 0.0,
            "yaw": 0.0,
            "airspeed": 0.0,
            "groundspeed": 0.0,
            "altitude": 0.0,
            "alt_msl": 0.0,
            "alt_rel": 0.0,
            "heading": 0,
            "throttle": 0,
            "vx": 0.0,
            "vy": 0.0,
            "vz": 0.0,
            "lat": 0.0,
            "lon": 0.0,
            "battery_voltage": 0.0,
            "battery_current": 0.0,
            "battery_remaining": -1,
            "gps_fix": "No Fix",
            "satellites": 0,
            "hdop": 99.0,
            "ekf_ok": False,
            "last_statustext": "",
            "last_msg_ts": 0.0,
        }
