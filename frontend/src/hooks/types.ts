export interface TelemetryData {
  connected: boolean
  armed: boolean
  mode: string
  roll: number
  pitch: number
  yaw: number
  altitude: number
  alt_msl: number
  alt_rel: number
  heading: number
  throttle: number
  airspeed: number
  groundspeed: number
  vx: number
  vy: number
  vz: number
  lat: number
  lon: number
  battery_voltage: number
  battery_current: number
  battery_remaining: number
  gps_fix: string
  satellites: number
  hdop: number
  ekf_ok: boolean
  last_statustext: string
  rpi_lat: number | null
  rpi_lon: number | null
  rpi_alt: number | null
  rpi_speed: number | null
  rpi_fix: number
  rpi_satellites: number
  frame_b64: string | null
  gps_source: string
  server_ts: number
  flood_mask_b64: string | null
  flood_coverage: number | null
  inference_ms: number | null
  rescue_path_pixels: [number, number][] | null
  flood_heatmap_b64: string | null
  flood_centroids: [number, number][] | null
}
