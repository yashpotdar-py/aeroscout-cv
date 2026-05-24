import { useEffect, useRef, useState } from 'react'
import { Map as MapIcon, Layers } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MissionMapProps {
  lat: number | null; lon: number | null; connected: boolean
  alt?: number | null; rescue_path_pixels?: [number, number][] | null
  flood_centroids?: [number, number][] | null
}

const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
const TILE_SAT = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const TILE_ATTR = '&copy; CARTO / Esri'
const DEFAULT_CENTER: L.LatLngTuple = [26.4499, 79.4038]

function makeDroneIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
             <img src="/assets/drone_marker.png" style="width:100%;height:100%;border-radius:50%;border:2px solid #FF5500;background:white;"/>
           </div>`,
    className: '', iconSize: [32, 32], iconAnchor: [16, 16]
  })
}

function pixelToGeo(px: number, py: number, lat: number, lon: number, alt: number): L.LatLng {
  const fov_rad = 60 * (Math.PI / 180)
  const gsd = (2 * alt * Math.tan(fov_rad / 2)) / 256
  const lat_offset = ((py - 128) * gsd) / 111320
  const lon_offset = ((px - 128) * gsd) / (111320 * Math.cos(lat * (Math.PI / 180)))
  return new L.LatLng(lat - lat_offset, lon + lon_offset)
}

function addCentroids(map: L.Map, existing: L.CircleMarker[], centroids: [number, number][] | null | undefined, lat: number | null, lon: number | null, alt: number | null | undefined) {
  existing.forEach(m => m.remove())
  if (!centroids || centroids.length === 0 || !lat || !lon) return []
  return centroids.map(([px, py]) => L.circleMarker(pixelToGeo(px, py, lat, lon, alt || 50), {
    radius: 4, color: '#ef4444', fillColor: 'transparent', weight: 1.5, className: 'target-centroid'
  }).addTo(map))
}

export default function MissionMap({ lat, lon, connected, alt, rescue_path_pixels, flood_centroids }: MissionMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const trailRef = useRef<L.Polyline | null>(null)
  const pathRef = useRef<L.Polyline | null>(null)
  const centroidsRef = useRef<L.CircleMarker[]>([])
  const trailArrayRef = useRef<[number, number][]>([])
  
  const [mapType, setMapType] = useState<'base' | 'satellite'>('satellite')
  const [mapTheme, setMapTheme] = useState(document.documentElement.getAttribute('data-theme') || 'dark')
  const layerRef = useRef<L.TileLayer | null>(null)

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setMapTheme(document.documentElement.getAttribute('data-theme') || 'dark')
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = L.map(containerRef.current, { zoomControl: false }).setView(DEFAULT_CENTER, 14)
    const baseTile = mapTheme === 'light' ? TILE_LIGHT : TILE_DARK;
    layerRef.current = L.tileLayer(mapType === 'satellite' ? TILE_SAT : baseTile, { attribution: TILE_ATTR, opacity: 1 }).addTo(map)
    markerRef.current = L.marker(DEFAULT_CENTER, { icon: makeDroneIcon() })
    trailRef.current = L.polyline([], { color: '#FF5500', weight: 2, opacity: 0.8, dashArray: '4, 4' }).addTo(map)
    mapRef.current = map
    setTimeout(() => map.invalidateSize(), 0)
    return () => { map.remove(); mapRef.current = null }
  // mapTheme and mapType are intentionally included to satisfy exhaustive-deps.
  // The `mapRef.current` guard prevents re-initialization after the first mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapTheme, mapType])

  useEffect(() => {
    if (layerRef.current) {
      const baseTile = mapTheme === 'light' ? TILE_LIGHT : TILE_DARK;
      layerRef.current.setUrl(mapType === 'satellite' ? TILE_SAT : baseTile)
    }
  }, [mapType, mapTheme])

  useEffect(() => {
    const map = mapRef.current; const marker = markerRef.current; if (!map || !marker) return
    if (lat && lon && lat !== 0 && lon !== 0) {
      if (!map.hasLayer(marker)) marker.addTo(map)
      const pos = new L.LatLng(lat, lon); marker.setLatLng(pos); map.panTo(pos, { animate: false })
      trailArrayRef.current.push([lat, lon])
      if (trailArrayRef.current.length > 150) trailArrayRef.current.shift()
      if (trailRef.current) trailRef.current.setLatLngs(trailArrayRef.current.map(([la, lo]) => new L.LatLng(la, lo)))
    }
  }, [lat, lon, connected])

  useEffect(() => {
    const map = mapRef.current; if (!map) return
    if (!rescue_path_pixels || !lat || !lon) { pathRef.current?.remove(); return }
    const latLngs = rescue_path_pixels.map(([px, py]) => pixelToGeo(px, py, lat, lon, alt || 50))
    if (pathRef.current) pathRef.current.remove()
    pathRef.current = L.polyline(latLngs, { color: '#a855f7', weight: 3 }).addTo(map)
  }, [rescue_path_pixels, lat, lon, alt])

  useEffect(() => {
    if (mapRef.current) centroidsRef.current = addCentroids(mapRef.current, centroidsRef.current, flood_centroids, lat, lon, alt)
  }, [flood_centroids, lat, lon, alt])

  return (
    <div className="flex flex-col w-full h-full bg-bg min-h-[300px]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <MapIcon className="w-4 h-4 text-orange-500" />
          <span className="font-sans text-[11px] font-bold tracking-[0.2em] text-text uppercase">SYS.MAP</span>
        </div>
        <button 
          onClick={() => setMapType(mapType === 'satellite' ? 'base' : 'satellite')}
          className="flex items-center gap-2 border border-border px-2 py-1 bg-surface hover:bg-orange-500 hover:text-white transition-colors text-text-muted"
        >
          <Layers className="w-3 h-3" />
          <span className="font-sans text-[9px] font-bold tracking-widest uppercase">
            {mapType === 'satellite' ? 'SAT_VIEW' : 'BASE_VIEW'}
          </span>
        </button>
      </div>
      <div className="relative flex-1 w-full overflow-hidden">
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
          <div className="px-3 py-1 bg-surface/80 backdrop-blur-sm border border-border flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-orange-500" />
            <span className="font-sans text-[10px] font-bold text-text tracking-widest uppercase">TRAIL_HIST</span>
          </div>
          <div className="px-3 py-1 bg-surface/80 backdrop-blur-sm border border-border flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-500" />
            <span className="font-sans text-[10px] font-bold text-text tracking-widest uppercase">RL_COMPUTE</span>
          </div>
        </div>
        
        {/* Crosshairs */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-orange-500/20 z-[502] pointer-events-none" />
        <div className="absolute left-0 right-0 top-1/2 h-px bg-orange-500/20 z-[502] pointer-events-none" />

        <div ref={containerRef} className="w-full h-full z-0" />
      </div>
    </div>
  )
}
