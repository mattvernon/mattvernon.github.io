import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import ArtifactCard from './ArtifactCard'
import WelcomeMessage from './WelcomeMessage'
import useHomeStore from '../store'
import { ARTIFACTS, getCanvasDimensions, getArtifactLayout } from '../constants'

const MOBILE_BREAKPOINT = 768
const PAN_THRESHOLD = 4

export default function Canvas() {
  const scrollRef = useRef(null)
  const welcomeRef = useRef(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT)
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 })

  const canvas = useMemo(() => getCanvasDimensions(), [])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Click-and-drag canvas panning (desktop only)
  const handleCanvasPointerDown = useCallback((e) => {
    // Only pan when clicking directly on the canvas background
    if (e.target !== e.currentTarget) return

    isPanning.current = false
    panStart.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: scrollRef.current.scrollLeft,
      scrollTop: scrollRef.current.scrollTop,
    }

    const handlePointerMove = (moveE) => {
      const dx = moveE.clientX - panStart.current.x
      const dy = moveE.clientY - panStart.current.y

      if (!isPanning.current && Math.abs(dx) + Math.abs(dy) > PAN_THRESHOLD) {
        isPanning.current = true
        document.body.style.cursor = 'grabbing'
      }

      if (isPanning.current) {
        scrollRef.current.scrollLeft = panStart.current.scrollLeft - dx
        scrollRef.current.scrollTop = panStart.current.scrollTop - dy
      }
    }

    const handlePointerUp = () => {
      isPanning.current = false
      document.body.style.cursor = ''
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }, [])

  // Store scroll ref so LayoutEditor re-center button can use it
  const setCanvasScrollRef = useHomeStore((s) => s.setCanvasScrollRef)
  useEffect(() => {
    setCanvasScrollRef(scrollRef)
  }, [setCanvasScrollRef])

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
        onPointerDown={handleCanvasPointerDown}
      >
        {ARTIFACTS.map((artifact, i) => {
          const layout = getArtifactLayout(i)
          return (
            <ArtifactCard
              key={artifact.filename}
              artifact={artifact}
              index={i}
              baseZ={layout.z || 1}
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
