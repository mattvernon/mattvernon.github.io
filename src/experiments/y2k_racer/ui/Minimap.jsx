import { useRef, useEffect } from 'react'
import useY2KRacerStore from '../store'
import { getMapConfig } from '../world/maps/index.js'

// Canvas dimensions (low-res, scaled up via CSS for pixelated look)
const CANVAS_SIZE = 200
const CENTER = CANVAS_SIZE / 2
const RADIUS = 83 // Same as speedometer

// How many world units fit in the minimap radius
const VIEW_RADIUS = 350
const SCALE = RADIUS / VIEW_RADIUS

const CYAN = '#00f0ff'
const CAR_COLOR = '#ff3c00'

// Pre-render the full road network onto an offscreen canvas (done once per map)
function createMapCanvas(mapConfig) {
  const { mapBounds, streets, waterZones, parkZones } = mapConfig

  const padding = RADIUS * 2
  const mapW = (mapBounds.maxX - mapBounds.minX) * SCALE
  const mapH = (mapBounds.maxZ - mapBounds.minZ) * SCALE

  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(mapW + padding * 2)
  canvas.height = Math.ceil(mapH + padding * 2)
  const ctx = canvas.getContext('2d')

  const ox = padding
  const oy = padding

  // Land background
  ctx.fillStyle = '#0f0f19'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Water zones
  ctx.fillStyle = '#0a1932'
  for (const wz of waterZones) {
    ctx.fillRect(
      ox + (wz.bounds.minX - mapBounds.minX) * SCALE,
      oy + (wz.bounds.minZ - mapBounds.minZ) * SCALE,
      (wz.bounds.maxX - wz.bounds.minX) * SCALE,
      (wz.bounds.maxZ - wz.bounds.minZ) * SCALE
    )
  }

  // Park zones
  ctx.fillStyle = '#0f2814'
  for (const pz of parkZones) {
    const b = pz.bounds
    ctx.fillRect(
      ox + (b.minX - mapBounds.minX) * SCALE,
      oy + (b.minZ - mapBounds.minZ) * SCALE,
      (b.maxX - b.minX) * SCALE,
      (b.maxZ - b.minZ) * SCALE
    )
  }

  // Roads
  ctx.lineCap = 'round'
  for (const seg of streets) {
    const sx = ox + (seg.start.x - mapBounds.minX) * SCALE
    const sy = oy + (seg.start.z - mapBounds.minZ) * SCALE
    const ex = ox + (seg.end.x - mapBounds.minX) * SCALE
    const ey = oy + (seg.end.z - mapBounds.minZ) * SCALE
    const lw = Math.max(1, seg.width * SCALE)

    ctx.beginPath()
    ctx.moveTo(sx, sy)
    ctx.lineTo(ex, ey)
    ctx.lineWidth = lw
    ctx.strokeStyle =
      seg.type === 'bridge'
        ? 'rgba(255,255,255,0.35)'
        : seg.type === 'avenue' || seg.type === 'broadway'
          ? 'rgba(255,255,255,0.25)'
          : 'rgba(255,255,255,0.15)'
    ctx.stroke()
  }

  return { canvas, padding, mapBounds }
}

function drawMinimap(ctx, mapCanvas, mapPadding, mapBounds, carX, carZ, heading) {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  ctx.lineCap = 'round'

  // Gauge face (same gradient as speedometer)
  const grad = ctx.createRadialGradient(CENTER, CENTER * 0.85, 0, CENTER, CENTER, RADIUS)
  grad.addColorStop(0, 'rgba(30, 30, 50, 0.95)')
  grad.addColorStop(1, 'rgba(5, 5, 15, 0.98)')
  ctx.beginPath()
  ctx.arc(CENTER, CENTER, RADIUS - 1, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()

  // Clip to inner circle and draw rotated map
  ctx.save()
  ctx.beginPath()
  ctx.arc(CENTER, CENTER, RADIUS - 4, 0, Math.PI * 2)
  ctx.clip()

  ctx.translate(CENTER, CENTER)
  ctx.rotate(heading - Math.PI)

  // Position offscreen map so the car's world position sits at (0,0)
  const carPx = mapPadding + (carX - mapBounds.minX) * SCALE
  const carPz = mapPadding + (carZ - mapBounds.minZ) * SCALE
  ctx.drawImage(mapCanvas, -carPx, -carPz)

  ctx.restore()

  // Car indicator (triangle pointing up)
  ctx.save()
  ctx.translate(CENTER, CENTER)
  ctx.beginPath()
  ctx.moveTo(0, -7)
  ctx.lineTo(-4.5, 5)
  ctx.lineTo(4.5, 5)
  ctx.closePath()
  ctx.fillStyle = CAR_COLOR
  ctx.fill()
  ctx.restore()

  // Outer ring (matching speedometer)
  ctx.beginPath()
  ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2)
  ctx.strokeStyle = CYAN
  ctx.lineWidth = 7
  ctx.globalAlpha = 0.6
  ctx.stroke()
  ctx.globalAlpha = 1
}

export default function Minimap() {
  const canvasRef = useRef(null)
  const selectedMap = useY2KRacerStore((s) => s.selectedMap)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const mapConfig = getMapConfig(selectedMap)
    const { canvas: mapCanvas, padding, mapBounds } = createMapCanvas(mapConfig)

    // Initial draw
    drawMinimap(ctx, mapCanvas, padding, mapBounds, 0, 0, 0)

    // Subscribe to store updates directly (avoids React re-renders)
    const unsub = useY2KRacerStore.subscribe((state) => {
      drawMinimap(ctx, mapCanvas, padding, mapBounds, state.carX, state.carZ, state.carHeading)
    })

    return unsub
  }, [selectedMap])

  return (
    <div className="minimap">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="minimap-canvas"
      />
    </div>
  )
}
