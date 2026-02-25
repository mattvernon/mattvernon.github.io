import { useMemo } from 'react'
import useRacingStore from '../store'

// Gauge layout
const SIZE = 300
const CENTER = SIZE / 2
const RADIUS = 125
const TICK_OUTER = RADIUS - 5
const TICK_INNER_MAJOR = RADIUS - 24
const TICK_INNER_MINOR = RADIUS - 14
const LABEL_RADIUS = RADIUS - 42
const NEEDLE_LENGTH = RADIUS - 18
const NEEDLE_TAIL = 16

// Speed range
const MAX_DISPLAY = 260
const MAJOR_STEP = 20
const MINOR_STEP = 10

// Arc: 210° sweep starting at 220° (~7 o'clock) going clockwise to 430°/70° (~2 o'clock)
const ARC_START = 220
const ARC_SWEEP = 210

function speedToAngle(speed) {
  const clamped = Math.max(0, Math.min(speed, MAX_DISPLAY))
  return ARC_START + (clamped / MAX_DISPLAY) * ARC_SWEEP
}

function generateTicks() {
  const ticks = []
  for (let s = 0; s <= MAX_DISPLAY; s += MINOR_STEP) {
    const isMajor = s % MAJOR_STEP === 0
    const deg = speedToAngle(s)
    const rad = (deg - 90) * (Math.PI / 180)

    const ox = CENTER + TICK_OUTER * Math.cos(rad)
    const oy = CENTER + TICK_OUTER * Math.sin(rad)
    const ir = isMajor ? TICK_INNER_MAJOR : TICK_INNER_MINOR
    const ix = CENTER + ir * Math.cos(rad)
    const iy = CENTER + ir * Math.sin(rad)

    ticks.push({ s, isMajor, ox, oy, ix, iy, rad })
  }
  return ticks
}

function buildArcPath() {
  const r = RADIUS - 6
  const startRad = (ARC_START - 90) * (Math.PI / 180)
  const endRad = (ARC_START + ARC_SWEEP - 90) * (Math.PI / 180)
  const x1 = CENTER + r * Math.cos(startRad)
  const y1 = CENTER + r * Math.sin(startRad)
  const x2 = CENTER + r * Math.cos(endRad)
  const y2 = CENTER + r * Math.sin(endRad)
  return `M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`
}

export default function Speedometer() {
  const speed = useRacingStore((s) => s.speed)
  const ticks = useMemo(generateTicks, [])
  const arcPath = useMemo(buildArcPath, [])
  const needleAngle = speedToAngle(speed)

  return (
    <div className="speedometer">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="speedo-svg"
      >
        <defs>
          <radialGradient id="gaugeFace" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="rgba(30, 30, 50, 0.95)" />
            <stop offset="100%" stopColor="rgba(5, 5, 15, 0.98)" />
          </radialGradient>
        </defs>

        {/* Outer glow ring */}
        <circle
          cx={CENTER} cy={CENTER} r={RADIUS}
          className="speedo-ring-glow"
        />

        {/* Dark gauge face */}
        <circle
          cx={CENTER} cy={CENTER} r={RADIUS - 2}
          fill="url(#gaugeFace)"
          className="speedo-face"
        />

        {/* Arc track */}
        <path d={arcPath} className="speedo-arc-track" />

        {/* Tick marks */}
        {ticks.map((t) => (
          <line
            key={t.s}
            x1={t.ox} y1={t.oy}
            x2={t.ix} y2={t.iy}
            className={
              t.isMajor
                ? `speedo-tick-major${t.s >= 200 ? ' speedo-tick-danger' : ''}`
                : `speedo-tick-minor${t.s >= 200 ? ' speedo-tick-danger' : ''}`
            }
          />
        ))}

        {/* Number labels at major ticks */}
        {ticks.filter((t) => t.isMajor).map((t) => {
          const lx = CENTER + LABEL_RADIUS * Math.cos(t.rad)
          const ly = CENTER + LABEL_RADIUS * Math.sin(t.rad)
          return (
            <text
              key={`l-${t.s}`}
              x={lx} y={ly}
              className={`speedo-label${t.s >= 200 ? ' speedo-label-danger' : ''}`}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {t.s}
            </text>
          )
        })}

        {/* Needle */}
        <g
          className="speedo-needle"
          style={{
            transform: `rotate(${needleAngle}deg)`,
            transformOrigin: `${CENTER}px ${CENTER}px`,
          }}
        >
          <line
            x1={CENTER} y1={CENTER + NEEDLE_TAIL}
            x2={CENTER} y2={CENTER - NEEDLE_LENGTH}
            className="speedo-needle-line"
          />
          <circle cx={CENTER} cy={CENTER} r={8} className="speedo-needle-cap" />
        </g>
      </svg>

      {/* Digital readout */}
      <div className="speedo-digital">
        <span className="speedo-digital-value">{speed}</span>
        <span className="speedo-digital-unit">KM/H</span>
      </div>
    </div>
  )
}
