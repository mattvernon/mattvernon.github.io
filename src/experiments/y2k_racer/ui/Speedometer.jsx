import { useRef, useEffect } from 'react'
import useY2KRacerStore from '../store'

// Low-res canvas (displayed at 1.5x for pixelated look)
const CANVAS_SIZE = 200
const CENTER = CANVAS_SIZE / 2
const RADIUS = 83

const TICK_OUTER = RADIUS - 4
const TICK_INNER_MAJOR = RADIUS - 20
const TICK_INNER_MINOR = RADIUS - 12
const LABEL_RADIUS = RADIUS - 33
const NEEDLE_LENGTH = RADIUS - 12
const NEEDLE_TAIL = 10

const MAX_DISPLAY = 260
const MAJOR_STEP = 20
const MINOR_STEP = 10

const ARC_START = 220
const ARC_SWEEP = 210

const CYAN = '#00f0ff'
const RED = '#ff3c00'
const DANGER_SPEED = 200

const FONT = '"Barlow Condensed", "Arial Narrow", sans-serif'

function speedToAngle(speed) {
  const clamped = Math.max(0, Math.min(speed, MAX_DISPLAY))
  return ARC_START + (clamped / MAX_DISPLAY) * ARC_SWEEP
}

function degToRad(deg) {
  return (deg - 90) * (Math.PI / 180)
}

function drawGauge(ctx, speed) {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  ctx.lineCap = 'round'

  // Gauge face
  const grad = ctx.createRadialGradient(CENTER, CENTER * 0.85, 0, CENTER, CENTER, RADIUS)
  grad.addColorStop(0, 'rgba(30, 30, 50, 0.95)')
  grad.addColorStop(1, 'rgba(5, 5, 15, 0.98)')
  ctx.beginPath()
  ctx.arc(CENTER, CENTER, RADIUS - 1, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()

  // Outer ring
  ctx.beginPath()
  ctx.arc(CENTER, CENTER, RADIUS, 0, Math.PI * 2)
  ctx.strokeStyle = CYAN
  ctx.lineWidth = 7
  ctx.globalAlpha = 0.6
  ctx.stroke()
  ctx.globalAlpha = 1

  // Arc track
  ctx.beginPath()
  ctx.arc(CENTER, CENTER, RADIUS - 3, degToRad(ARC_START), degToRad(ARC_START + ARC_SWEEP))
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Ticks and labels
  ctx.font = `600 9px ${FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let s = 0; s <= MAX_DISPLAY; s += MINOR_STEP) {
    const isMajor = s % MAJOR_STEP === 0
    const rad = degToRad(speedToAngle(s))
    const danger = s >= DANGER_SPEED

    const ox = CENTER + TICK_OUTER * Math.cos(rad)
    const oy = CENTER + TICK_OUTER * Math.sin(rad)
    const inner = isMajor ? TICK_INNER_MAJOR : TICK_INNER_MINOR
    const ix = CENTER + inner * Math.cos(rad)
    const iy = CENTER + inner * Math.sin(rad)

    ctx.beginPath()
    ctx.moveTo(ox, oy)
    ctx.lineTo(ix, iy)
    ctx.strokeStyle = danger
      ? 'rgba(255, 60, 0, 0.8)'
      : isMajor
        ? 'rgba(255, 255, 255, 0.85)'
        : 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = isMajor ? 2 : 1
    ctx.stroke()

    if (isMajor) {
      const lx = CENTER + LABEL_RADIUS * Math.cos(rad)
      const ly = CENTER + LABEL_RADIUS * Math.sin(rad)
      ctx.fillStyle = danger ? 'rgba(255, 60, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'
      ctx.fillText(String(s), lx, ly)
    }
  }

  // Needle
  const nRad = degToRad(speedToAngle(speed))
  ctx.beginPath()
  ctx.moveTo(
    CENTER - NEEDLE_TAIL * Math.cos(nRad),
    CENTER - NEEDLE_TAIL * Math.sin(nRad)
  )
  ctx.lineTo(
    CENTER + NEEDLE_LENGTH * Math.cos(nRad),
    CENTER + NEEDLE_LENGTH * Math.sin(nRad)
  )
  ctx.strokeStyle = RED
  ctx.lineWidth = 2
  ctx.stroke()

  // Needle cap
  ctx.beginPath()
  ctx.arc(CENTER, CENTER, 5, 0, Math.PI * 2)
  ctx.fillStyle = RED
  ctx.fill()

  // Digital readout — bottom-right free space
  const dx = CENTER + 32
  const dy = CENTER + 48
  ctx.textAlign = 'right'
  ctx.textBaseline = 'alphabetic'

  ctx.font = `italic 700 44px ${FONT}`
  ctx.fillStyle = '#fff'
  ctx.fillText(String(Math.round(speed)), dx, dy)

  ctx.font = `italic 400 10px ${FONT}`
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
  ctx.fillText('KM/H', dx, dy + 12)
}

export default function Speedometer() {
  const canvasRef = useRef(null)
  const speed = useY2KRacerStore((s) => s.speed)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    drawGauge(ctx, speed)
  }, [speed])

  return (
    <div className="speedometer">
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="speedo-canvas"
      />
    </div>
  )
}
