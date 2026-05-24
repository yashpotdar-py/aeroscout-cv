import { useEffect, useRef, useState } from 'react'
import { Camera } from 'lucide-react'

interface VideoFeedProps {
  frame_b64: string | null
  connected: boolean
  flood_mask_b64?: string | null
  flood_heatmap_b64?: string | null
  coverage_pct?: number | null
}

export default function VideoFeed({ frame_b64, connected, flood_heatmap_b64, coverage_pct }: VideoFeedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const heatmapCanvasRef = useRef<HTMLCanvasElement>(null)
  const [timeStr, setTimeStr] = useState<string>('00:00:00:00')

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date()
      setTimeStr([d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, '0')).join(':') + ':' + String(Math.floor(d.getMilliseconds() / 10)).padStart(2, '0'))
    }, 50)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return

    if (!connected || !frame_b64) {
      ctx.fillStyle = '#09090b'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = 'bold 24px JetBrains Mono'
      ctx.fillStyle = '#FF5500'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('NO_SIGNAL', canvas.width / 2, canvas.height / 2)
      return
    }
    const img = new Image()
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    img.src = 'data:image/jpeg;base64,' + frame_b64
  }, [frame_b64, connected])

  useEffect(() => {
    const canvas = heatmapCanvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return

    if (!flood_heatmap_b64) {
      ctx.fillStyle = '#09090b'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = 'bold 24px JetBrains Mono'
      ctx.fillStyle = '#3f3f46'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('AWAITING_INFERENCE', canvas.width / 2, canvas.height / 2)
      return
    }
    const img = new Image()
    img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    img.src = 'data:image/png;base64,' + flood_heatmap_b64
  }, [flood_heatmap_b64])

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-800">
      <div className="flex items-center gap-3 px-6 py-3 border-b border-zinc-800 bg-zinc-900 shrink-0">
        <Camera className="w-4 h-4 text-orange-500" />
        <span className="font-sans text-[11px] font-bold tracking-[0.2em] text-zinc-50 uppercase">SYS.OPTICS</span>
      </div>
      
      <div className="flex flex-col flex-1 min-h-0">
        <div className="relative flex-1 bg-black">
          <div className="absolute top-0 left-0 z-10 flex items-center gap-2 px-3 py-1 bg-orange-500">
            <span className="font-sans text-[10px] font-bold text-white tracking-[0.2em] uppercase">CAM_01</span>
          </div>
          <div className="absolute bottom-0 right-0 z-10 px-3 py-1 bg-zinc-950 border-t border-l border-zinc-800">
            <span className="font-mono text-[10px] text-zinc-50">{timeStr}</span>
          </div>
          <div className="absolute inset-0 scanline z-20 pointer-events-none opacity-50" />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block object-cover opacity-90 mix-blend-luminosity" width={1280} height={720} />
          {/* Target Reticle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border border-orange-500/50 z-20 flex items-center justify-center pointer-events-none">
             <div className="w-1 h-1 bg-orange-500" />
          </div>
        </div>

        <div className="h-px bg-zinc-800 w-full" />

        <div className="relative flex-1 bg-black">
          <div className="absolute top-0 left-0 z-10 flex items-center gap-2 px-3 py-1 bg-purple-600">
            <span className="font-sans text-[10px] font-bold text-white tracking-[0.2em] uppercase">LNN_SEG</span>
          </div>
          {flood_heatmap_b64 && (
            <div className="absolute bottom-0 right-0 z-10 px-3 py-1 bg-zinc-950 border-t border-l border-zinc-800 flex items-center gap-2">
              <span className="font-sans text-[10px] text-zinc-400 tracking-[0.2em] uppercase">COV</span>
              <span className="font-mono text-[10px] font-bold text-purple-400">
                {coverage_pct != null ? coverage_pct.toFixed(1) : '0.0'}%
              </span>
            </div>
          )}
          <div className="absolute inset-0 scanline z-20 pointer-events-none opacity-50" />
          <canvas ref={heatmapCanvasRef} className="absolute inset-0 w-full h-full block object-cover opacity-90" width={1280} height={720} />
        </div>
      </div>
    </div>
  )
}
