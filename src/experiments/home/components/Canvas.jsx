import { useEffect, useRef, useState, useMemo } from 'react'
import ArtifactCard from './ArtifactCard'
import WelcomeMessage from './WelcomeMessage'
import { ARTIFACTS, getCanvasDimensions, getArtifactLayout } from '../constants'

const MOBILE_BREAKPOINT = 768

export default function Canvas() {
  const scrollRef = useRef(null)
  const welcomeRef = useRef(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT)

  const canvas = useMemo(() => getCanvasDimensions(), [])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // On mount (desktop), scroll to center of canvas
  useEffect(() => {
    const el = scrollRef.current
    if (!el || isMobile) return

    el.scrollLeft = (canvas.w - el.clientWidth) / 2
    el.scrollTop = (canvas.h - el.clientHeight) / 2
  }, [isMobile, canvas])

  // On mount (mobile), scroll so welcome message is centered in viewport
  useEffect(() => {
    if (!isMobile || !welcomeRef.current) return
    const el = scrollRef.current
    if (!el) return

    requestAnimationFrame(() => {
      const welcomeEl = welcomeRef.current
      if (!welcomeEl) return
      const welcomeTop = welcomeEl.offsetTop
      const welcomeHeight = welcomeEl.offsetHeight
      const viewportHeight = el.clientHeight
      el.scrollTop = welcomeTop - (viewportHeight - welcomeHeight) / 2
    })
  }, [isMobile])

  if (isMobile) {
    const mid = Math.floor(ARTIFACTS.length / 2)
    const topArtifacts = ARTIFACTS.slice(0, mid)
    const bottomArtifacts = ARTIFACTS.slice(mid)

    return (
      <div className="hm-canvas-mobile" ref={scrollRef}>
        <div className="hm-canvas-mobile-grid">
          {topArtifacts.map((artifact, i) => (
            <ArtifactCard key={artifact.filename} artifact={artifact} index={i} mobile />
          ))}
        </div>
        <div ref={welcomeRef}>
          <WelcomeMessage mobile />
        </div>
        <div className="hm-canvas-mobile-grid">
          {bottomArtifacts.map((artifact, i) => (
            <ArtifactCard key={artifact.filename} artifact={artifact} index={mid + i} mobile />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="hm-canvas-scroll" ref={scrollRef}>
      <div
        className="hm-canvas-inner"
        style={{ width: canvas.w, height: canvas.h }}
      >
        {ARTIFACTS.map((artifact, i) => {
          const layout = getArtifactLayout(i)
          return (
            <ArtifactCard
              key={artifact.filename}
              artifact={artifact}
              index={i}
              style={{
                position: 'absolute',
                left: layout.x,
                top: layout.y,
                width: layout.width,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
