import { useEffect, useRef, useState } from 'react'
import { MusicManager } from '../utils/audio'
import useForeverStore from '../store'

export default function MusicPlayer() {
  const music = useForeverStore((s) => s.music)
  const isPlaying = useForeverStore((s) => s.isPlaying)
  const hasStarted = useForeverStore((s) => s.hasStarted)
  const currentTrackIndex = useForeverStore((s) => s.currentTrackIndex)
  const setCurrentTrackIndex = useForeverStore((s) => s.setCurrentTrackIndex)
  const managerRef = useRef(null)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)

  useEffect(() => {
    const mgr = new MusicManager()
    managerRef.current = mgr
    mgr.onTrackChange = (index) => setCurrentTrackIndex(index)
    return () => mgr.dispose()
  }, [setCurrentTrackIndex])

  // Load playlist when music changes
  useEffect(() => {
    if (managerRef.current && music.length > 0) {
      managerRef.current.loadPlaylist(music)
    }
  }, [music])

  // Play/pause with playback state
  useEffect(() => {
    if (!managerRef.current || music.length === 0) return
    if (hasStarted) {
      managerRef.current.play()
    }
  }, [hasStarted, music.length])

  const handleMute = () => {
    if (managerRef.current) {
      const isMuted = managerRef.current.toggleMute()
      setMuted(isMuted)
    }
  }

  const handleSkip = () => {
    if (managerRef.current) {
      managerRef.current.skipTrack()
    }
  }

  const handleVolume = (e) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (managerRef.current) {
      managerRef.current.setVolume(val)
    }
  }

  if (music.length === 0) return null

  const track = music[currentTrackIndex]

  return (
    <div className="music-player">
      {/* Mute/Unmute */}
      <button className="music-btn" onClick={handleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
        {muted ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        )}
      </button>

      {/* Volume slider */}
      <input
        type="range"
        className="music-volume"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolume}
        aria-label="Volume"
      />

      {/* Track title */}
      <div className="music-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </div>
      {track && <span className="music-title">{track.title}</span>}

      {/* Skip track */}
      <button className="music-btn" onClick={handleSkip} aria-label="Skip track">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
        </svg>
      </button>
    </div>
  )
}
