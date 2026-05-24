import { useEffect, useRef, useState } from 'react'
import type { TelemetryData } from './types'

export function useWebSocket(url: string): { data: TelemetryData | null; connected: boolean } {
  const [data, setData] = useState<TelemetryData | null>(null)
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const unmountedRef = useRef(false)

  useEffect(() => {
    unmountedRef.current = false

    function connect() {
      if (unmountedRef.current) return

      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        if (!unmountedRef.current) setConnected(true)
      }

      ws.onmessage = (event) => {
        if (unmountedRef.current) return
        try {
          const parsed = JSON.parse(event.data) as TelemetryData
          setData(parsed)
        } catch (err) {
          console.error('WS JSON parse error:', err)
        }
      }

      ws.onclose = () => {
        if (unmountedRef.current) return
        setConnected(false)
        reconnectTimerRef.current = setTimeout(connect, 2000)
      }

      ws.onerror = () => {
        ws.close()
      }
    }

    connect()

    return () => {
      unmountedRef.current = true
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      if (wsRef.current) wsRef.current.close()
    }
  }, [url])

  return { data, connected }
}
