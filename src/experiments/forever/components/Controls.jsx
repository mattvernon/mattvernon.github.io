import { useEffect, useCallback } from 'react'
import useForeverStore from '../store'

export default function Controls() {
  const currentIndex = useForeverStore((s) => s.currentIndex)
  const photos = useForeverStore((s) => s.photos)
  const isPlaying = useForeverStore((s) => s.isPlaying)
  const next = useForeverStore((s) => s.next)
  const prev = useForeverStore((s) => s.prev)
  const play = useForeverStore((s) => s.play)
  const pause = useForeverStore((s) => s.pause)

  const total = photos.length + 1 // +1 for goodbye
  const isFirst = currentIndex === 0
  const isLast = currentIndex === total - 1
  const progress = total > 1 ? currentIndex / (total - 1) : 0

  const handlePausePlay = () => {
    if (isPlaying) pause()
    else play()
  }

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault()
      next()
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      prev()
    }
  }, [next, prev])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (total === 0) return null

  return (
    <div className="controls-overlay">
      <button
        className="controls-arrow controls-arrow--prev"
        onClick={prev}
        disabled={isFirst}
        aria-label="Previous"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <button
        className="controls-arrow controls-arrow--next"
        onClick={next}
        disabled={isLast}
        aria-label="Next"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Pause/Play — bottom center */}
      <button
        className="controls-pause"
        onClick={handlePausePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="controls-progress-bar">
        <div
          className="controls-progress-fill"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  )
}
