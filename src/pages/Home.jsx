import { useEffect, useRef, useCallback } from 'react'
import '../styles/Home.css'

const NAMED_COLORS = [
  'blue', 'red', 'green', 'yellow', 'orange', 'purple', 'pink',
  'cyan', 'magenta', 'lime', 'navy', 'teal', 'maroon', 'olive',
  'coral', 'indigo', 'violet', 'turquoise', 'crimson', 'gold',
]

export default function Home() {
  const containerRef = useRef(null)
  const animationRef = useRef(null)
  const posRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 })
  const speedRef = useRef(1) // 1 = full speed, 0.05 = nearly stopped

  const changeBackgroundColor = useCallback(() => {
    const color = NAMED_COLORS[Math.floor(Math.random() * NAMED_COLORS.length)]
    document.body.style.backgroundColor = color
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const containerWidth = container.offsetWidth
    const containerHeight = container.offsetHeight

    const pos = posRef.current
    pos.x = Math.random() * (window.innerWidth - containerWidth)
    pos.y = Math.random() * (window.innerHeight - containerHeight)
    pos.vx = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2)
    pos.vy = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2)

    function animate() {
      const cw = container.offsetWidth
      const ch = container.offsetHeight
      const maxX = window.innerWidth - cw
      const maxY = window.innerHeight - ch

      pos.x += pos.vx * speedRef.current
      pos.y += pos.vy * speedRef.current

      if (pos.x <= 0 || pos.x >= maxX) {
        pos.vx = -pos.vx
        pos.x = Math.max(0, Math.min(pos.x, maxX))
      }

      if (pos.y <= 0 || pos.y >= maxY) {
        pos.vy = -pos.vy
        pos.y = Math.max(0, Math.min(pos.y, maxY))
      }

      container.style.transform = `translate(${Math.round(pos.x)}px, ${Math.round(pos.y)}px)`
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Reset body background when unmounting (for route changes)
  useEffect(() => {
    document.body.style.backgroundColor = 'white'
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

  return (
    <div className="home" onClick={changeBackgroundColor}>
      <div
        className="container"
        ref={containerRef}
        onMouseEnter={() => { speedRef.current = 0.05 }}
        onMouseLeave={() => { speedRef.current = 1 }}
      >
        <p>matthew vernon</p>
        <p>a designer on the internet</p>
        <p>cofounder of <a href="https://foundation-labs.xyz" target="_blank" rel="noopener noreferrer">foundation labs</a></p>
        <p>born in sydney</p>
        <p>living in brooklyn, ny</p>
      </div>
    </div>
  )
}
