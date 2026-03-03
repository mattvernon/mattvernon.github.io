import { useRef, useCallback, useMemo } from 'react'
import useHomeStore from '../store'

const IS_DEV = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

function getTypeLabel(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  if (ext === 'mp4' || ext === 'webm') return 'Video'
  if (ext === 'gif') return 'GIF'
  return 'Image'
}

// Simple hash to get a pseudo-random but stable delay per card
function staggerDelay(index) {
  const shuffled = ((index * 7 + 3) % 18)
  return 0.15 + shuffled * 0.06 // 0.15s–1.17s range
}

export default function ArtifactCard({ artifact, index = 0, style, mobile, baseZ }) {
  const dragRef = useRef(null)
  const isDragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const startOffset = useRef({ dx: 0, dy: 0 })

  const setDragOffset = useHomeStore((s) => s.setDragOffset)
  const setWidthOverride = useHomeStore((s) => s.setWidthOverride)
  const setZOverride = useHomeStore((s) => s.setZOverride)
  const bringToFront = useHomeStore((s) => s.bringToFront)
  const dragOffset = useHomeStore((s) => s.dragOffsets[artifact.filename])
  const widthOverride = useHomeStore((s) => s.widthOverrides[artifact.filename])
  const zOverride = useHomeStore((s) => s.zOverrides[artifact.filename])
  const zOrder = useHomeStore((s) => s.zOrder)

  // Dev z-override > drag z-order > layout z > default
  const dragZ = zOrder.indexOf(artifact.filename)
  const resolvedZ = zOverride != null ? zOverride : (dragZ === -1 ? (baseZ || 1) : dragZ + 100)

  const isVideo = artifact.type === 'video'
  const typeLabel = getTypeLabel(artifact.filename)
  const src = `/artifacts/${artifact.filename}`

  const handleResizeDown = useCallback((e) => {
    e.stopPropagation()
    const startX = e.clientX
    const startWidth = dragRef.current?.offsetWidth || 200
    bringToFront(artifact.filename)

    const handleResizeMove = (e) => {
      const delta = e.clientX - startX
      setWidthOverride(artifact.filename, Math.max(120, startWidth + delta))
    }

    const handleResizeUp = () => {
      window.removeEventListener('pointermove', handleResizeMove)
      window.removeEventListener('pointerup', handleResizeUp)
    }

    window.addEventListener('pointermove', handleResizeMove)
    window.addEventListener('pointerup', handleResizeUp)
  }, [artifact.filename, setWidthOverride, bringToFront])

  const handlePointerDown = useCallback((e) => {
    if (mobile) return
    if (e.target.closest('.hm-artifact-resize-handle')) return
    isDragging.current = false
    startPos.current = { x: e.clientX, y: e.clientY }
    startOffset.current = dragOffset || { dx: 0, dy: 0 }

    const handlePointerMove = (e) => {
      const dx = e.clientX - startPos.current.x
      const dy = e.clientY - startPos.current.y

      // Only start dragging after 4px threshold to allow clicking
      if (!isDragging.current && Math.abs(dx) + Math.abs(dy) > 4) {
        isDragging.current = true
        bringToFront(artifact.filename)
      }

      if (isDragging.current) {
        setDragOffset(
          artifact.filename,
          startOffset.current.dx + dx,
          startOffset.current.dy + dy
        )
      }
    }

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }, [mobile, dragOffset, artifact.filename, setDragOffset, bringToFront])

  const dx = dragOffset?.dx || 0
  const dy = dragOffset?.dy || 0

  const delay = useMemo(() => staggerDelay(index), [index])

  const widthStyle = widthOverride
    ? { width: `${widthOverride}px`, minWidth: 'unset', maxWidth: 'unset' }
    : {}

  const mergedStyle = mobile
    ? { animationDelay: `${delay}s` }
    : {
        ...style,
        ...widthStyle,
        transform: `${style?.transform || ''} translate(${dx}px, ${dy}px)`,
        zIndex: resolvedZ,
        cursor: 'grab',
        animationDelay: `${delay}s`,
      }

  return (
    <div
      className={`hm-artifact-card${mobile ? ' hm-artifact-card--mobile' : ''}`}
      style={mergedStyle}
      ref={dragRef}
      onPointerDown={handlePointerDown}
    >
      <div className="hm-artifact-header">
        <span className="hm-artifact-filename">{artifact.filename}</span>
        <span className="hm-artifact-type-pill">{typeLabel}</span>
      </div>
      <div className="hm-artifact-body">
        {isVideo ? (
          <video
            src={src}
            autoPlay
            loop
            muted
            playsInline
            className="hm-artifact-media"
            draggable={false}
          />
        ) : (
          <img
            src={src}
            alt={artifact.filename}
            loading="lazy"
            className="hm-artifact-media"
            draggable={false}
          />
        )}
      </div>
      {IS_DEV && !mobile && (
        <>
          <div className="hm-artifact-resize-handle" onPointerDown={handleResizeDown} />
          <div className="hm-artifact-z-controls">
            <button
              className="hm-artifact-z-btn"
              onClick={(e) => { e.stopPropagation(); setZOverride(artifact.filename, resolvedZ + 1) }}
            >↑</button>
            <span className="hm-artifact-z-label">{resolvedZ}</span>
            <button
              className="hm-artifact-z-btn"
              onClick={(e) => { e.stopPropagation(); setZOverride(artifact.filename, Math.max(1, resolvedZ - 1)) }}
            >↓</button>
          </div>
        </>
      )}
    </div>
  )
}
