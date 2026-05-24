import { useNavigate } from 'react-router-dom'
import { Radar, LayoutDashboard, History, Settings, ChevronLeft, Cpu, Square } from 'lucide-react'
import { useWebSocket } from '../hooks/useWebSocket'
import type { TelemetryData } from '../hooks/types'
import { BACKEND_WS_URL, BACKEND_HTTP_URL } from '../config'
import TelemetryPanel from '../components/TelemetryPanel'
import VideoFeed from '../components/VideoFeed'
import MissionMap from '../components/MissionMap'
import MissionLog from '../components/MissionLog'
import DemoToggle from '../components/DemoToggle'

function Sidebar({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full w-[80px] bg-zinc-950 border-r border-zinc-800 shrink-0">
      <div className="flex items-center justify-center h-[56px] border-b border-zinc-800">
        <Square className="w-6 h-6 text-zinc-50 fill-zinc-50" />
      </div>
      <div className="flex-1 flex flex-col items-center py-8 gap-8">
        {[
          { icon: LayoutDashboard, label: 'CMD', active: true },
          { icon: History, label: 'LOG', active: false },
          { icon: Cpu, label: 'FLT', active: false },
          { icon: Settings, label: 'CFG', active: false },
        ].map((item, i) => (
          <button
            key={i}
            aria-label={item.label}
            title={item.label}
            className={`w-full h-16 flex flex-col items-center justify-center gap-2 transition-all border-l-2
              ${item.active
                ? 'bg-zinc-900/60 text-orange-500 border-orange-500 shadow-[inset_2px_0_10px_rgba(255,85,0,0.1)]'
                : 'text-zinc-400 border-transparent hover:text-zinc-50 hover:bg-zinc-900'
              }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-sans text-[10px] font-bold tracking-widest uppercase">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-center h-[80px] border-t border-zinc-800">
        <button
          onClick={onBack}
          aria-label="Disconnect"
          title="Disconnect"
          className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-orange-500 hover:bg-zinc-900 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
          <span className="font-sans text-[10px] font-bold tracking-widest uppercase">EXIT</span>
        </button>
      </div>
    </div>
  )
}

function StatusBar({ connected, data }: { connected: boolean; data: TelemetryData | null }) {
  const gpsSource = data?.gps_source?.toUpperCase() ?? 'NONE'
  const mode = data?.mode?.toUpperCase() ?? 'STDBY'
  const battPct = data?.battery_remaining ?? null

  return (
    <div className="flex items-center justify-between h-[56px] px-6 bg-zinc-950 border-b border-zinc-800 shrink-0">
      <div className="flex items-center gap-6">
        <span className="font-display text-xl font-bold tracking-wider text-zinc-50 uppercase flex items-center gap-2">
          <Radar className="w-5 h-5 text-orange-500" />
          COMMAND_OS
        </span>
        <div className="w-px h-6 bg-zinc-800" />
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className={`font-sans text-xs font-bold tracking-[0.1em] ${connected ? 'text-green-500' : 'text-red-500'}`}>
            {connected ? 'LINK_ACTIVE' : 'LINK_LOST'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 border border-zinc-800 px-3 py-1 bg-zinc-900">
          <span className="font-sans text-[10px] text-zinc-400 tracking-[0.2em] uppercase">GPS</span>
          <span className="font-mono text-sm text-zinc-50 font-bold">{gpsSource}</span>
        </div>
        <div className="flex items-center gap-2 border border-zinc-800 px-3 py-1 bg-zinc-900">
          <span className="font-sans text-[10px] text-zinc-400 tracking-[0.2em] uppercase">MOD</span>
          <span className="font-mono text-sm text-zinc-50 font-bold">{mode}</span>
        </div>
        {battPct != null && (
          <div className="flex items-center gap-2 border border-zinc-800 px-3 py-1 bg-zinc-900">
            <span className="font-sans text-[10px] text-zinc-400 tracking-[0.2em] uppercase">BAT</span>
            <span className={`font-mono text-sm font-bold ${battPct < 20 ? 'text-red-500 animate-pulse' : battPct < 50 ? 'text-yellow-500' : 'text-green-500'}`}>
              {battPct}%
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="font-mono text-sm text-zinc-400 tracking-widest">
          {new Date().toISOString().split('T')[1].split('.')[0]}Z
        </span>
      </div>
    </div>
  )
}

export default function CommandCenter() {
  const navigate = useNavigate()
  const { data, connected } = useWebSocket(BACKEND_WS_URL)

  const lat: number | null = (data?.rpi_fix ?? 0) >= 2 ? (data?.rpi_lat ?? null) : (data?.lat ?? null)
  const lon: number | null = (data?.rpi_fix ?? 0) >= 2 ? (data?.rpi_lon ?? null) : (data?.lon ?? null)

  return (
    <div className="w-full h-screen flex bg-zinc-950 text-zinc-50 overflow-hidden font-sans">
      <Sidebar onBack={() => navigate('/')} />
      <div className="flex-1 flex flex-col min-w-0">
        <StatusBar connected={connected} data={data} />
        <div className="flex-1 flex min-h-0">
          <div className="w-[340px] shrink-0 border-r border-zinc-800 bg-zinc-950">
            <TelemetryPanel data={data} connected={connected} />
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 flex min-h-0">
              <div className="flex-1 min-w-0 border-r border-zinc-800 relative">
                <MissionMap lat={lat} lon={lon} connected={connected} alt={data?.rpi_alt ?? data?.altitude ?? null} rescue_path_pixels={data?.rescue_path_pixels ?? null} flood_centroids={data?.flood_centroids ?? null} />
              </div>
              <div className="w-[500px] shrink-0 bg-zinc-950">
                <VideoFeed frame_b64={data?.frame_b64 ?? null} connected={connected} flood_mask_b64={data?.flood_mask_b64 ?? null} flood_heatmap_b64={data?.flood_heatmap_b64 ?? null} coverage_pct={data?.flood_coverage ?? null} />
              </div>
            </div>
            <div className="h-[240px] shrink-0 border-t border-zinc-800 bg-zinc-950">
              <MissionLog data={data} connected={connected} />
            </div>
          </div>
        </div>
      </div>
      <DemoToggle apiBase={BACKEND_HTTP_URL} />
    </div>
  )
}
