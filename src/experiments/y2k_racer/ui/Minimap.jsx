import { useRef, useEffect } from 'react'
import useY2KRacerStore from '../store'
import { STREETS, MAP_BOUNDS, WATER_ZONES, CENTRAL_PARK } from '../world/MapData'

// Canvas dimensions (low-res, scaled up via CSS for pixelated look)
const CANVAS_SIZE = 200
const CENTER = CANVAS_SIZE / 2
const RADIUS = 83 // Same as speedometer

// How many world units fit in the minimap radius
const VIEW_RADIUS = 350
const SCALE = RADIUS / VIEW_RADIUS

const CYAN = '#00f0ff'
const CAR_COLOR = '#ff3c00'

// Pre-render the full road network onto an offscreen canvas (done once)
function createMapCanvas() {
  // Padding so rotation at map edges doesn't show blank areas
  const padding = RADIUS * 2
  const mapW = (MAP_BOUNDS.maxX - MAP_BOUNDS.minX) * SCALE
  const mapH = (MAP_BOUNDS.maxZ - MAP_BOUNDS.minZ) * SCALE

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
  for (const wz of WATER_ZONES) {
    ctx.fillRect(
      ox + (wz.bounds.minX - MAP_BOUNDS.minX) * SCALE,
      oy + (wz.bounds.minZ - MAP_BOUNDS.minZ) * SCALE,
      (wz.bounds.maxX - wz.bounds.minX) * SCALE,
      (wz.bounds.maxZ - wz.bounds.minZ) * SCALE
    )
  }

  // Central Park
  ctx.fillStyle = '#0f2814'
  ctx.fillRect(
    ox + (CENTRAL_PARK.minX - MAP_BOUNDS.minX) * SCALE,
    oy + (CENTRAL_PARK.minZ - MAP_BOUNDS.minZ) * SCALE,
    (CENTRAL_PARK.maxX - CENTRAL_PARK.minX) * SCALE,
    (CENTRAL_PARK.maxZ - CENTRAL_PARK.minZ) * SCALE
  )

  // Roads
  ctx.lineCap = 'round'
  for (const seg of STREETS) {
    const sx = ox + (seg.start.x - MAP_BOUNDS.minX) * SCALE
    const sy = oy + (seg.start.z - MAP_BOUNDS.minZ) * SCALE
    const ex = ox + (seg.end.x - MAP_BOUNDS.minX) * SCALE
    const ey = oy + (seg.end.z - MAP_BOUNDS.minZ) * SCALE
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

  return { canvas, padding }
}

function drawMinimap(ctx, mapCanvas, mapPadding, carX, carZ, heading) {
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
  const carPx = mapPadding + (carX - MAP_BOUNDS.minX) * SCALE
  const carPz = mapPadding + (carZ - MAP_BOUNDS.minZ) * SCALE
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

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Pre-render the road network once
    const { canvas: mapCanvas, padding } = createMapCanvas()

    // Initial draw
    drawMinimap(ctx, mapCanvas, padding, 0, 0, 0)

    // Subscribe to store updates directly (avoids React re-renders)
    const unsub = useY2KRacerStore.subscribe((state) => {
      drawMinimap(ctx, mapCanvas, padding, state.carX, state.carZ, state.carHeading)
    })

    return unsub
  }, [])

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
