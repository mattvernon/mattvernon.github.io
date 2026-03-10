import { useRef, useEffect, useMemo } from 'react'
import { KEN_BURNS_PRESETS, SLIDE_DURATION } from '../constants'

// Deterministic random based on index so positions are stable on rewind
function seededRandom(seed) {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

const WIDTH = { min: 30, max: 45 }

export default function PhotoSlide({ src, index }) {
  const imgRef = useRef(null)
  const preset = KEN_BURNS_PRESETS[index % KEN_BURNS_PRESETS.length]

  const layout = useMemo(() => {
    const r1 = seededRandom(index)
    const r3 = seededRandom(index + 200)
    const r4 = seededRandom(index + 300)

    const width = WIDTH.min + r4 * (WIDTH.max - WIDTH.min)

    // Clamp position so the full photo stays within the viewport
    const pad = 4
    const halfW = width / 2
    const minLeft = halfW + pad
    const maxLeft = 100 - halfW - pad
    const left = minLeft + r1 * Math.max(0, maxLeft - minLeft)

    const top = 50

    // Slight rotation for scrapbook feel
    const rotation = (r3 - 0.5) * 6

    return { width, left, top, rotation }
  }, [index])

  useEffect(() => {
    const img = imgRef.current
    if (!img) return
    img.style.transition = 'none'
    img.style.transform = preset.from
    img.offsetHeight // force reflow
    img.style.transition = `transform ${SLIDE_DURATION + 2000}ms ease-out`
    img.style.transform = preset.to
  }, [src, preset])

  return (
    <div
      className="photo-slide"
      style={{
        left: `${layout.left}%`,
        top: `${layout.top}%`,
        maxWidth: `${layout.width}vw`,
        transform: `translate(-50%, -50%) rotate(${layout.rotation}deg)`,
      }}
    >
      <div className="photo-slide-inner">
        <img
          ref={imgRef}
          src={`/photos/forever/${src}`}
          alt=""
          draggable={false}
        />
      </div>
    </div>
  )
}
