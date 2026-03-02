import { useRef, useCallback, useMemo } from 'react'
import useHomeStore from '../store'

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

export default function ArtifactCard({ artifact, index = 0, style, mobile }) {
  const dragRef = useRef(null)
  const isDragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const startOffset = useRef({ dx: 0, dy: 0 })

  const setDragOffset = useHomeStore((s) => s.setDragOffset)
  const bringToFront = useHomeStore((s) => s.bringToFront)
  const dragOffset = useHomeStore((s) => s.dragOffsets[artifact.filename])
  const zOrder = useHomeStore((s) => s.zOrder)

  const zIndex = zOrder.indexOf(artifact.filename)
  const resolvedZ = zIndex === -1 ? 1 : zIndex + 2

  const isVideo = artifact.type === 'video'
  const typeLabel = getTypeLabel(artifact.filename)
  const src = `/artifacts/${artifact.filename}`

  const handlePointerDown = useCallback((e) => {
    if (mobile) return
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

  const mergedStyle = mobile
    ? { animationDelay: `${delay}s` }
    : {
        ...style,
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
    </div>
  )
}
