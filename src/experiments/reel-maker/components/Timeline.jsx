import { useRef, useState, useCallback } from 'react'
import useReelStore from '../store'

const PX_PER_SEC = 80
const MIN_DURATION = 0.1
const MAX_DURATION = 30

function formatTime(s) {
  const mins = Math.floor(s / 60)
  const secs = s % 60
  return `${mins}:${secs.toFixed(1).padStart(4, '0')}`
}

export default function Timeline() {
  const timeline = useReelStore((s) => s.timeline)
  const media = useReelStore((s) => s.media)
  const selectedItemId = useReelStore((s) => s.selectedItemId)
  const currentTime = useReelStore((s) => s.currentTime)
  const isPlaying = useReelStore((s) => s.isPlaying)
  const selectItem = useReelStore((s) => s.selectItem)
  const reorderTimeline = useReelStore((s) => s.reorderTimeline)
  const updateItem = useReelStore((s) => s.updateItem)
  const removeFromTimeline = useReelStore((s) => s.removeFromTimeline)
  const seek = useReelStore((s) => s.seek)
  const play = useReelStore((s) => s.play)
  const pause = useReelStore((s) => s.pause)
  const getTotalDuration = useReelStore((s) => s.getTotalDuration)

  const trackRef = useRef(null)
  const [dragIndex, setDragIndex] = useState(null)
  const [dropIndex, setDropIndex] = useState(null)

  const totalDuration = getTotalDuration()

  // Drag to reorder — uses document-level listeners for reliability
  const onBlockPointerDown = useCallback((e, index) => {
    if (e.target.classList.contains('rm-resize-handle') || e.target.classList.contains('rm-start-handle')) return
    e.preventDefault()
    selectItem(timeline[index]?.id)

    const startX = e.clientX
    let currentDropIndex = null
    setDragIndex(index)

    const onMove = (ev) => {
      const track = trackRef.current
      if (!track) return
      const blocks = track.querySelectorAll('.rm-timeline-block')
      let cumX = 0
      let newDropIndex = timeline.length
      for (let i = 0; i < blocks.length; i++) {
        const w = blocks[i].offsetWidth
        const mid = cumX + w / 2
        const cursorInTrack = ev.clientX - track.getBoundingClientRect().left + track.parentElement.scrollLeft
        if (cursorInTrack < mid) {
          newDropIndex = i
          break
        }
        cumX += w
      }
      currentDropIndex = newDropIndex
      setDropIndex(newDropIndex)
    }

    const onUp = () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      if (currentDropIndex !== null && currentDropIndex !== index) {
        const to = currentDropIndex > index ? currentDropIndex - 1 : currentDropIndex
        reorderTimeline(index, to)
      }
      setDragIndex(null)
      setDropIndex(null)
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }, [timeline, selectItem, reorderTimeline])

  // Resize duration — uses document-level listeners for reliability
  const onResizePointerDown = useCallback((e, itemId, currentDuration) => {
    e.preventDefault()
    e.stopPropagation()

    const startX = e.clientX
    const originalDuration = currentDuration

    const onMove = (ev) => {
      const dx = ev.clientX - startX
      const deltaSec = dx / PX_PER_SEC
      let newDuration = originalDuration + deltaSec
      newDuration = Math.round(newDuration * 10) / 10
      newDuration = Math.max(MIN_DURATION, Math.min(MAX_DURATION, newDuration))
      updateItem(itemId, { duration: newDuration })
    }

    const onUp = () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }, [updateItem])

  // Left trim (start offset) — uses document-level listeners for reliability
  const onStartTrimPointerDown = useCallback((e, itemId, currentStartOffset, currentDuration, mediaDuration) => {
    e.preventDefault()
    e.stopPropagation()

    const startX = e.clientX
    const origOffset = currentStartOffset
    const origDuration = currentDuration

    const onMove = (ev) => {
      const dx = ev.clientX - startX
      const deltaSec = dx / PX_PER_SEC
      let newOffset = origOffset + deltaSec
      let newDuration = origDuration - deltaSec

      // Clamp: offset can't go below 0
      if (newOffset < 0) {
        newDuration += newOffset // reclaim the overshoot
        newOffset = 0
      }
      // Clamp: duration can't go below minimum
      if (newDuration < MIN_DURATION) {
        newOffset -= (MIN_DURATION - newDuration)
        newDuration = MIN_DURATION
      }
      // Clamp: for video/gif, offset + duration can't exceed media length
      if (mediaDuration && newOffset + newDuration > mediaDuration) {
        newOffset = mediaDuration - newDuration
      }

      newOffset = Math.round(Math.max(0, newOffset) * 10) / 10
      newDuration = Math.round(Math.max(MIN_DURATION, newDuration) * 10) / 10
      updateItem(itemId, { startOffset: newOffset, duration: newDuration })
    }

    const onUp = () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }, [updateItem])

  // Click on track background to seek
  const onTrackClick = useCallback((e) => {
    if (e.target !== trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const scrollLeft = trackRef.current.parentElement.scrollLeft
    const x = e.clientX - rect.left + scrollLeft
    const time = x / PX_PER_SEC
    seek(Math.max(0, Math.min(time, totalDuration)))
  }, [seek, totalDuration])

  // Compute drop indicator position
  let dropIndicatorX = null
  if (dropIndex !== null && dragIndex !== null) {
    let x = 0
    for (let i = 0; i < dropIndex; i++) {
      if (i < timeline.length) {
        x += timeline[i].duration * PX_PER_SEC
      }
    }
    dropIndicatorX = x
  }

  const playheadX = currentTime * PX_PER_SEC

  return (
    <div className="rm-timeline">
      <div className="rm-timeline-controls">
        <button onClick={() => isPlaying ? pause() : play()}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <span className="rm-time-display">
          {formatTime(currentTime)} / {formatTime(totalDuration)}
        </span>
      </div>

      <div className="rm-timeline-scroll">
        <div
          ref={trackRef}
          className="rm-timeline-track"
          style={{ width: Math.max(totalDuration * PX_PER_SEC, 200) }}
          onClick={onTrackClick}
        >
          {timeline.map((item, index) => {
            const m = media[item.mediaId]
            const width = item.duration * PX_PER_SEC
            const isDragging = dragIndex === index
            return (
              <div
                key={item.id}
                className={`rm-timeline-block ${item.id === selectedItemId ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
                style={{ width }}
                onClick={(e) => { e.stopPropagation(); selectItem(item.id) }}
                onPointerDown={(e) => onBlockPointerDown(e, index)}
                onDoubleClick={() => removeFromTimeline(item.id)}
              >
                {m?.thumbnailUrl && (
                  <img className="rm-block-thumb" src={m.thumbnailUrl} alt="" />
                )}
                <span className="rm-block-duration">{item.duration.toFixed(1)}s</span>
                <div
                  className="rm-start-handle"
                  onPointerDown={(e) => onStartTrimPointerDown(e, item.id, item.startOffset || 0, item.duration, m?.duration || null)}
                />
                <div
                  className="rm-resize-handle"
                  onPointerDown={(e) => onResizePointerDown(e, item.id, item.duration)}
                />
              </div>
            )
          })}

          <div
            className="rm-playhead"
            style={{ transform: `translateX(${playheadX}px)` }}
          />

          {dropIndicatorX !== null && (
            <div
              className="rm-drop-indicator"
              style={{ transform: `translateX(${dropIndicatorX}px)` }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
