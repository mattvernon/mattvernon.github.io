import { useRef, useEffect } from 'react'
import { getMapConfig } from '../world/maps/index.js'

const CANVAS_W = 200
const CANVAS_H = 200

export default function MapPreviewCanvas({ mapId }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const config = getMapConfig(mapId)
    if (!config) return

    const { mapBounds, streets, waterZones, parkZones } = config

    const worldW = mapBounds.maxX - mapBounds.minX
    const worldH = mapBounds.maxZ - mapBounds.minZ
    const pad = 10
    const drawW = CANVAS_W - pad * 2
    const drawH = CANVAS_H - pad * 2
    const scale = Math.min(drawW / worldW, drawH / worldH)
    const ox = pad + (drawW - worldW * scale) / 2
    const oy = pad + (drawH - worldH * scale) / 2

    // Background
    ctx.fillStyle = '#0a0a14'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    // Water zones
    ctx.fillStyle = '#0a1932'
    for (const wz of waterZones) {
      ctx.fillRect(
        ox + (wz.bounds.minX - mapBounds.minX) * scale,
        oy + (wz.bounds.minZ - mapBounds.minZ) * scale,
        (wz.bounds.maxX - wz.bounds.minX) * scale,
        (wz.bounds.maxZ - wz.bounds.minZ) * scale
      )
    }

    // Park zones
    ctx.fillStyle = '#0f2814'
    for (const pz of parkZones) {
      const b = pz.bounds
      ctx.fillRect(
        ox + (b.minX - mapBounds.minX) * scale,
        oy + (b.minZ - mapBounds.minZ) * scale,
        (b.maxX - b.minX) * scale,
        (b.maxZ - b.minZ) * scale
      )
    }

    // Roads
    ctx.lineCap = 'round'
    for (const seg of streets) {
      const sx = ox + (seg.start.x - mapBounds.minX) * scale
      const sy = oy + (seg.start.z - mapBounds.minZ) * scale
      const ex = ox + (seg.end.x - mapBounds.minX) * scale
      const ey = oy + (seg.end.z - mapBounds.minZ) * scale
      const lw = Math.max(0.5, seg.width * scale)

      ctx.beginPath()
      ctx.moveTo(sx, sy)
      ctx.lineTo(ex, ey)
      ctx.lineWidth = lw
      ctx.strokeStyle =
        seg.type === 'bridge'
          ? 'rgba(255,255,255,0.4)'
          : seg.type === 'avenue' || seg.type === 'broadway'
            ? 'rgba(255,255,255,0.3)'
            : 'rgba(255,255,255,0.15)'
      ctx.stroke()
    }

    // Spawn point indicator
    const spawnX = ox + (config.spawnPoint.x - mapBounds.minX) * scale
    const spawnZ = oy + (config.spawnPoint.z - mapBounds.minZ) * scale
    ctx.beginPath()
    ctx.arc(spawnX, spawnZ, 3, 0, Math.PI * 2)
    ctx.fillStyle = '#ff3c00'
    ctx.fill()
  }, [mapId])

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="map-preview-canvas"
    />
  )
}
