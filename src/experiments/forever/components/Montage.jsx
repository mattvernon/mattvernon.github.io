import { useEffect, useRef, useState, useCallback } from 'react'
import useForeverStore from '../store'
import { SLIDE_DURATION, TRANSITION_DURATION } from '../constants'
import { preloadImages } from '../utils/preloader'
import PhotoSlide from './PhotoSlide'
import GoodbyeScreen from './GoodbyeScreen'
import Controls from './Controls'
import MusicPlayer from './MusicPlayer'

export default function Montage() {
  const photos = useForeverStore((s) => s.photos)
  const loading = useForeverStore((s) => s.loading)
  const currentIndex = useForeverStore((s) => s.currentIndex)
  const isPlaying = useForeverStore((s) => s.isPlaying)
  const hasStarted = useForeverStore((s) => s.hasStarted)
  const next = useForeverStore((s) => s.next)
  const play = useForeverStore((s) => s.play)
  const pause = useForeverStore((s) => s.pause)
  const loadManifest = useForeverStore((s) => s.loadManifest)

  const isGoodbye = currentIndex >= photos.length

  // Load manifest on mount
  useEffect(() => {
    loadManifest()
  }, [loadManifest])

  // A/B slot crossfade — avoids the flash bug
  const [slotA, setSlotA] = useState({ index: 0, src: null })
  const [slotB, setSlotB] = useState({ index: -1, src: null })
  const [activeSlot, setActiveSlot] = useState('A')
  const timerRef = useRef(null)
  const prevIndexRef = useRef(0)

  // Preload ahead
  useEffect(() => {
    preloadImages(photos, currentIndex, 8)
  }, [currentIndex, photos])

  // Handle slide changes — load new photo into inactive slot, then flip
  useEffect(() => {
    if (currentIndex === prevIndexRef.current && hasStarted) return
    prevIndexRef.current = currentIndex

    const src = currentIndex < photos.length ? photos[currentIndex] : null

    if (activeSlot === 'A') {
      setSlotB({ index: currentIndex, src })
      requestAnimationFrame(() => setActiveSlot('B'))
    } else {
      setSlotA({ index: currentIndex, src })
      requestAnimationFrame(() => setActiveSlot('A'))
    }
  }, [currentIndex, photos, hasStarted]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-advance timer
  useEffect(() => {
    clearTimeout(timerRef.current)
    if (!isPlaying || isGoodbye) return

    timerRef.current = setTimeout(() => {
      next()
    }, SLIDE_DURATION + TRANSITION_DURATION)

    return () => clearTimeout(timerRef.current)
  }, [isPlaying, currentIndex, isGoodbye, next, pause])

  const handleStart = useCallback(() => play(), [play])

  if (loading) {
    return (
      <div className="montage-empty">
        <p>Loading...</p>
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="montage-empty">
        <p>No photos found.</p>
      </div>
    )
  }

  return (
    <div className="montage-container">
      {!hasStarted ? (
        <div className="montage-start" onClick={handleStart}>
          <div className="montage-start-content">
            <div className="montage-start-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <p>Click to begin</p>
          </div>
        </div>
      ) : (
        <div className="montage-stage">
          {/* Slot A */}
          <div
            className="montage-layer"
            style={{
              opacity: activeSlot === 'A' ? 1 : 0,
              zIndex: activeSlot === 'A' ? 2 : 1,
            }}
          >
            {slotA.src ? (
              <PhotoSlide src={slotA.src} index={slotA.index} />
            ) : slotA.index >= photos.length ? (
              <GoodbyeScreen />
            ) : null}
          </div>

          {/* Slot B */}
          <div
            className="montage-layer"
            style={{
              opacity: activeSlot === 'B' ? 1 : 0,
              zIndex: activeSlot === 'B' ? 2 : 1,
            }}
          >
            {slotB.src ? (
              <PhotoSlide src={slotB.src} index={slotB.index} />
            ) : slotB.index >= photos.length ? (
              <GoodbyeScreen />
            ) : null}
          </div>

          <Controls />
          <MusicPlayer />
        </div>
      )}
    </div>
  )
}
