import { useState } from 'react'

export default function DemoToggle({ apiBase = 'http://localhost:8000' }: { apiBase?: string }) {
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false)

  const handleToggle = async () => {
    try {
      await fetch(`${apiBase}/demo/${isDemoActive ? 'stop' : 'start'}`, { method: 'POST' })
    } catch (_err) {
      // Network errors are intentionally swallowed — demo toggle is best-effort
      void _err
    }
    setIsDemoActive(!isDemoActive)
  }

  return (
    <>
      <button
        onClick={handleToggle}
        className={`fixed bottom-4 right-4 z-[9999] px-4 py-2 font-mono text-[10px] font-bold tracking-[0.2em] uppercase border transition-colors ${
          isDemoActive 
            ? 'bg-orange-500 text-white border-orange-500 animate-pulse' 
            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-50'
        }`}
      >
        {isDemoActive ? 'DEMO_OVERRIDE_ACTIVE' : 'SIMULATION_MODE'}
      </button>
    </>
  )
}
