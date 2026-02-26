import { useRef, useState, useEffect, useCallback } from 'react'

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '00:00:00'
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function QuickTime() {
  const videoRef = useRef(null)
  const scrubberRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [muted, setMuted] = useState(true)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onLoadedMetadata = () => setDuration(video.duration)
    const onTimeUpdate = () => {
      if (!dragging) setCurrentTime(video.currentTime)
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => setPlaying(false)

    video.addEventListener('loadedmetadata', onLoadedMetadata)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
    }
  }, [dragging])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused || video.ended) {
      if (video.ended) video.currentTime = 0
      video.play()
    } else {
      video.pause()
    }
  }, [])

  const handleVideoClick = useCallback((e) => {
    e.stopPropagation()
    togglePlay()
  }, [togglePlay])

  const handleScrubberMouseDown = useCallback((e) => {
    e.stopPropagation()
    setDragging(true)
    const rect = scrubberRef.current.getBoundingClientRect()
    const seek = (clientX) => {
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const time = ratio * duration
      setCurrentTime(time)
      videoRef.current.currentTime = time
    }
    seek(e.clientX)

    const onMouseMove = (ev) => seek(ev.clientX)
    const onMouseUp = () => {
      setDragging(false)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }, [duration])

  const handleVolumeChange = useCallback((e) => {
    e.stopPropagation()
    const val = parseFloat(e.target.value)
    setVolume(val)
    videoRef.current.volume = val
    if (val > 0 && muted) {
      setMuted(false)
      videoRef.current.muted = false
    } else if (val === 0) {
      setMuted(true)
      videoRef.current.muted = true
    }
  }, [muted])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="quicktime">
      <div className="quicktime-video-area" onClick={handleVideoClick}>
        <video
          ref={videoRef}
          className="quicktime-video"
          src="/videos/welcome.mp4"
          muted
          autoPlay
          playsInline
          preload="auto"
        />
      </div>

      <div className="quicktime-controls">
        {/* Top row: LCD time | transport buttons | volume + speaker */}
        <div className="quicktime-controls-row">
          {/* LCD Time Display */}
          <div className="quicktime-lcd">
            <span className="quicktime-lcd-time">{formatTime(currentTime)}</span>
          </div>

          {/* Centered transport buttons */}
          <div className="quicktime-transport">
            <button
              className="quicktime-transport-btn"
              onClick={(e) => {
                e.stopPropagation()
                if (videoRef.current) {
                  videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5)
                }
              }}
              aria-label="Rewind"
            >
              <svg width="12" height="10" viewBox="0 0 12 10">
                <polygon points="6,0 6,10 0,5" fill="currentColor" />
                <polygon points="12,0 12,10 6,5" fill="currentColor" />
              </svg>
            </button>

            <button
              className="quicktime-transport-btn quicktime-transport-play"
              onClick={(e) => { e.stopPropagation(); togglePlay() }}
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? (
                <svg width="10" height="12" viewBox="0 0 10 12">
                  <rect x="1" y="1" width="3" height="10" rx="0.5" fill="currentColor" />
                  <rect x="6" y="1" width="3" height="10" rx="0.5" fill="currentColor" />
                </svg>
              ) : (
                <svg width="10" height="12" viewBox="0 0 10 12">
                  <polygon points="2,0 10,6 2,12" fill="currentColor" />
                </svg>
              )}
            </button>

            <button
              className="quicktime-transport-btn"
              onClick={(e) => {
                e.stopPropagation()
                if (videoRef.current) {
                  videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5)
                }
              }}
              aria-label="Fast Forward"
            >
              <svg width="12" height="10" viewBox="0 0 12 10">
                <polygon points="0,0 6,5 0,10" fill="currentColor" />
                <polygon points="6,0 12,5 6,10" fill="currentColor" />
              </svg>
            </button>
          </div>

          {/* Volume slider + speaker grille */}
          <div className="quicktime-volume-area">
            <input
              type="range"
              className="quicktime-volume-slider"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="quicktime-speaker-grille">
              <div className="quicktime-grille-dot" />
              <div className="quicktime-grille-dot" />
              <div className="quicktime-grille-dot" />
              <div className="quicktime-grille-dot" />
              <div className="quicktime-grille-dot" />
              <div className="quicktime-grille-dot" />
              <div className="quicktime-grille-dot" />
              <div className="quicktime-grille-dot" />
              <div className="quicktime-grille-dot" />
              <div className="quicktime-grille-dot" />
              <div className="quicktime-grille-dot" />
              <div className="quicktime-grille-dot" />
              <div className="quicktime-grille-dot" />
              <div className="quicktime-grille-dot" />
              <div className="quicktime-grille-dot" />
              <div className="quicktime-grille-dot" />
            </div>
          </div>
        </div>

        {/* Bottom row: progress bar spanning full width */}
        <div className="quicktime-progress-row">
          <div
            className="quicktime-scrubber"
            ref={scrubberRef}
            onMouseDown={handleScrubberMouseDown}
          >
            <div className="quicktime-scrubber-track">
              <div
                className="quicktime-scrubber-fill"
                style={{ width: `${progress}%` }}
              />
              <div
                className="quicktime-scrubber-thumb"
                style={{ left: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
