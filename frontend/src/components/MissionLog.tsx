import { useEffect, useRef, useState } from 'react'
import { Terminal } from 'lucide-react'
import type { TelemetryData } from '../hooks/types'

interface MissionLogProps {
  data: TelemetryData | null
  connected: boolean
}

interface LogEntry {
  id: number; ts: string; type: 'SYS' | 'TEL' | 'LNN'; message: string
}

let entryId = 0
const stamp = () => {
  const d = new Date()
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':') + '.' + String(Math.floor(d.getMilliseconds() / 10)).padStart(2, '0')
}

export default function MissionLog({ data, connected }: MissionLogProps) {
  // Boot message is seeded directly into initial state to avoid
  // a synchronous setState call inside a useEffect (set-state-in-effect rule).
  const [entries, setEntries] = useState<LogEntry[]>(() => [
    { id: ++entryId, ts: stamp(), type: 'SYS', message: 'AEROSCOUT_OS BOOT SEQUENCE INITIATED.' },
  ])
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevConnectedRef = useRef<boolean | null>(null)
  const lastTelemetryPushRef = useRef<number>(0)
  const prevCoverageRef = useRef<number | null>(null)

  const push = (type: LogEntry['type'], message: string) => {
    setEntries(prev => {
      const next = [...prev, { id: ++entryId, ts: stamp(), type, message }]
      if (next.length > 50) next.splice(0, next.length - 50)
      return next
    })
  }



  useEffect(() => {
    if (prevConnectedRef.current === null) { prevConnectedRef.current = connected; return }
    if (connected && !prevConnectedRef.current) push('SYS', 'MAVLINK STREAM ESTABLISHED.')
    if (!connected && prevConnectedRef.current) push('SYS', 'MAVLINK STREAM LOST. AWAITING RECONNECT.')
    prevConnectedRef.current = connected
  }, [connected])

  useEffect(() => {
    if (data == null) return
    const now = Date.now()
    if (now - lastTelemetryPushRef.current < 5000) return
    lastTelemetryPushRef.current = now
    push('TEL', `MOD:${data.mode} | ARM:${data.armed ? 'T' : 'F'} | ALT:${data.altitude.toFixed(1)}M | FIX:${data.gps_fix}`)
  }, [data])

  useEffect(() => {
    const cov = data?.flood_coverage ?? null; if (cov == null) return
    const prev = prevCoverageRef.current
    if (prev !== null && Math.abs(cov - prev) <= 5.0) return
    push('LNN', `SEGMENTATION UPDATE. COV: ${cov.toFixed(1)}%.`)
    prevCoverageRef.current = cov
  }, [data?.flood_coverage])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [entries])

  return (
    <div className="flex flex-col bg-zinc-950 w-full h-full">
      <div className="flex items-center gap-3 px-6 py-2 shrink-0 border-b border-zinc-800 bg-zinc-900">
        <Terminal className="w-4 h-4 text-orange-500" />
        <span className="font-sans text-[11px] font-bold tracking-[0.2em] text-zinc-50 uppercase">SYS.LOG</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 cmd-scroll">
        {entries.map(e => (
          <div key={e.id} className="flex gap-4 leading-relaxed hover:bg-zinc-900 py-0.5">
            <span className="font-mono text-xs text-zinc-500 shrink-0 mt-0.5">{e.ts}</span>
            <span className={`font-mono text-xs font-bold mt-0.5 shrink-0 w-8 ${
              e.type === 'SYS' ? 'text-zinc-500' : e.type === 'TEL' ? 'text-blue-500' : 'text-purple-500'
            }`}>
              [{e.type}]
            </span>
            <span className={`font-mono text-xs mt-0.5 ${
              e.type === 'LNN' ? 'text-purple-400' : e.type === 'TEL' ? 'text-zinc-50' : 'text-zinc-400'
            }`}>
              {e.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
