import { useRef, useCallback } from 'react'
import useReelStore from '../store'
import useCanvasRenderer from '../hooks/useCanvasRenderer'

function formatTime(s) {
  const mins = Math.floor(s / 60)
  const secs = s % 60
  return `${mins}:${secs.toFixed(1).padStart(4, '0')}`
}

export default function CanvasPreview({ audioRef }) {
  const canvasRef = useRef(null)
  const isPlaying = useReelStore((s) => s.isPlaying)
  const currentTime = useReelStore((s) => s.currentTime)
  const play = useReelStore((s) => s.play)
  const pause = useReelStore((s) => s.pause)
  const seek = useReelStore((s) => s.seek)
  const getTotalDuration = useReelStore((s) => s.getTotalDuration)
  const selectedItemId = useReelStore((s) => s.selectedItemId)
  const updateItemTransform = useReelStore((s) => s.updateItemTransform)
  const outputWidth = useReelStore((s) => s.outputWidth)
  const outputHeight = useReelStore((s) => s.outputHeight)

  useCanvasRenderer(canvasRef, audioRef)

  const totalDuration = getTotalDuration()

  // Drag-to-reposition on canvas
  const dragRef = useRef(null)

  const onCanvasPointerDown = useCallback((e) => {
    if (!selectedItemId) return
    const canvas = canvasRef.current
    if (!canvas) return
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      itemId: selectedItemId,
      // We need to get current transform values
      initialTransform: null,
    }
    // Read current item transform
    const state = useReelStore.getState()
    const item = state.timeline.find((t) => t.id === selectedItemId)
    if (item) {
      dragRef.current.initialTransform = { ...item.transform }
    }
    canvas.setPointerCapture(e.pointerId)
  }, [selectedItemId])

  const onCanvasPointerMove = useCallback((e) => {
    if (!dragRef.current || !dragRef.current.initialTransform) return
    const canvas = canvasRef.current
    if (!canvas) return

    // Convert pixel delta to canvas-space delta
    const cssRect = canvas.getBoundingClientRect()
    const scaleX = outputWidth / cssRect.width
    const scaleY = outputHeight / cssRect.height

    const dx = (e.clientX - dragRef.current.startX) * scaleX
    const dy = (e.clientY - dragRef.current.startY) * scaleY

    // Constrain to axis if shift held
    let newX = dragRef.current.initialTransform.x + dx
    let newY = dragRef.current.initialTransform.y + dy
    if (e.shiftKey) {
      if (Math.abs(dx) > Math.abs(dy)) {
        newY = dragRef.current.initialTransform.y
      } else {
        newX = dragRef.current.initialTransform.x
      }
    }

    updateItemTransform(dragRef.current.itemId, {
      x: Math.round(newX),
      y: Math.round(newY),
    })
  }, [updateItemTransform, outputWidth, outputHeight])

  const onCanvasPointerUp = useCallback(() => {
    dragRef.current = null
  }, [])

  // Scroll wheel to adjust scale
  const onCanvasWheel = useCallback((e) => {
    if (!selectedItemId) return
    e.preventDefault()
    const state = useReelStore.getState()
    const item = state.timeline.find((t) => t.id === selectedItemId)
    if (!item) return
    const delta = e.deltaY > 0 ? -5 : 5
    const newScale = Math.max(10, Math.min(200, item.transform.scale + delta))
    updateItemTransform(selectedItemId, { scale: newScale })
  }, [selectedItemId, updateItemTransform])

  return (
    <div className="rm-canvas-preview">
      <div className="rm-canvas-wrapper">
        <canvas
          ref={canvasRef}
          onPointerDown={onCanvasPointerDown}
          onPointerMove={onCanvasPointerMove}
          onPointerUp={onCanvasPointerUp}
          onWheel={onCanvasWheel}
          style={{ cursor: selectedItemId ? 'grab' : 'default' }}
        />
      </div>
      <div className="rm-playback-controls">
        <button onClick={() => isPlaying ? pause() : play()}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <input
          type="range"
          min={0}
          max={totalDuration || 1}
          step={0.01}
          value={currentTime}
          onChange={(e) => seek(Number(e.target.value))}
        />
        <span className="rm-time-display">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </span>
      </div>
    </div>
  )
}
