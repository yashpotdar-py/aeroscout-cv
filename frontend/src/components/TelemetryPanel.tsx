import { BarChart3 } from 'lucide-react'
import type { TelemetryData } from '../hooks/types'

interface TelemetryPanelProps {
  data: TelemetryData | null
  connected: boolean
}

function V({ label, val, unit, alert }: { label: string; val: React.ReactNode; unit?: string; alert?: boolean }) {
  return (
    <div className="flex flex-col border-b border-zinc-800 pb-1">
      <span className="font-sans text-[10px] text-zinc-400 tracking-[0.2em] uppercase mb-1">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`font-mono text-xl font-bold ${alert ? 'text-red-500 animate-pulse' : 'text-zinc-50'}`}>{val}</span>
        {unit && <span className="font-sans text-[11px] text-zinc-400">{unit}</span>}
      </div>
    </div>
  )
}

function Section({ title, children, accent }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="flex flex-col mb-8">
      <div className="flex items-center gap-2 border-b-2 pb-2 mb-4" style={{ borderColor: accent || '#3f3f46' }}>
        <div className="w-2 h-2" style={{ backgroundColor: accent || '#3f3f46' }} />
        <span className="font-sans text-[12px] font-bold tracking-[0.2em] uppercase text-zinc-50">{title}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-5 px-1">{children}</div>
    </div>
  )
}

export default function TelemetryPanel({ data }: TelemetryPanelProps) {
  const nil = <span className="text-zinc-800 font-mono">----</span>

  const roll = data != null ? data.roll.toFixed(1) : null
  const pitch = data != null ? data.pitch.toFixed(1) : null
  const yaw = data != null ? data.yaw.toFixed(1) : null
  const heading = data != null ? Math.round(data.heading) : null

  const mode = data != null ? data.mode.toUpperCase() : null
  const armed = data != null ? data.armed : null
  const alt = data != null ? data.altitude.toFixed(1) : null
  const throttle = data != null ? data.throttle : null

  const voltage = data != null ? data.battery_voltage : null
  const voltageFmt = voltage != null ? voltage.toFixed(1) : null
  const current = data != null ? data.battery_current.toFixed(2) : null

  const floodCoverage = data?.flood_coverage ?? null
  const inferencMs = data?.inference_ms ?? null
  const coverageFmt = floodCoverage != null ? floodCoverage.toFixed(1) : null

  const gpsSource = data != null ? data.gps_source.toUpperCase() : null
  const gpsFix = data != null ? data.gps_fix : null
  const sats = data != null ? data.satellites : null

  let lat: string | null = null; let lon: string | null = null
  if (data != null && ((data.rpi_fix >= 2 && data.rpi_lat != null) || data.lat !== 0)) {
    lat = ((data.rpi_fix >= 2 ? data.rpi_lat : data.lat) as number).toFixed(6)
    lon = ((data.rpi_fix >= 2 ? data.rpi_lon : data.lon) as number).toFixed(6)
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800 bg-zinc-900 shrink-0">
        <BarChart3 className="w-5 h-5 text-orange-500" />
        <span className="font-sans text-[11px] font-bold tracking-[0.2em] text-zinc-50 uppercase">SYS.TELEMETRY</span>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-8 cmd-scroll">
        <Section title="ATTITUDE" accent="#3b82f6">
          <V label="ROLL" val={roll ?? nil} unit="°" />
          <V label="PITCH" val={pitch ?? nil} unit="°" />
          <V label="YAW" val={yaw ?? nil} unit="°" />
          <V label="HDG" val={heading ?? nil} unit="°" />
        </Section>
        
        <Section title="FLIGHT_CTRL" accent="#10b981">
          <V label="MODE" val={mode ?? nil} />
          <V label="STATE" val={armed != null ? (armed ? 'ARMED' : 'SAFE') : nil} alert={armed === true} />
          <V label="ALT" val={alt ?? nil} unit="m" />
          <V label="THR" val={throttle ?? nil} unit="%" />
        </Section>
        
        <Section title="PWR_SYS" accent="#eab308">
          <V label="VOLT" val={voltageFmt ?? nil} unit="V" />
          <V label="CURR" val={current ?? nil} unit="A" />
        </Section>
        
        <Section title="NAV_DATA" accent="#a1a1aa">
          <V label="SRC" val={gpsSource ?? nil} />
          <V label="FIX" val={gpsFix ?? nil} />
          <V label="SAT" val={sats ?? nil} />
          <div className="col-span-2 flex flex-col border-b border-zinc-800 pb-1 mt-2">
            <span className="font-sans text-[10px] text-zinc-400 tracking-[0.2em] uppercase mb-1">POS_VECTOR</span>
            <span className="font-mono text-base font-bold text-orange-500">
              {lat != null && lon != null ? `${lat}, ${lon}` : nil}
            </span>
          </div>
        </Section>
        
        <Section title="LNN_CORE" accent="#8b5cf6">
          <V label="COV" val={coverageFmt ?? nil} unit="%" />
          <V label="LATENCY" val={inferencMs ?? nil} unit="ms" />
        </Section>
      </div>
    </div>
  )
}
