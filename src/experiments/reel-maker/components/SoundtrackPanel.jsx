import { useRef, useCallback, useState } from 'react'
import useReelStore from '../store'

function formatDuration(s) {
  if (!s) return '0:00'
  const mins = Math.floor(s / 60)
  const secs = Math.floor(s % 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}

export default function SoundtrackPanel({ audioRef }) {
  const soundtrack = useReelStore((s) => s.soundtrack)
  const setSoundtrack = useReelStore((s) => s.setSoundtrack)
  const removeSoundtrack = useReelStore((s) => s.removeSoundtrack)
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('audio/')) return
    const objectUrl = URL.createObjectURL(file)

    // Get duration
    const audio = new Audio()
    audio.src = objectUrl
    await new Promise((resolve) => {
      audio.onloadedmetadata = resolve
      audio.onerror = resolve
    })

    setSoundtrack({
      file,
      name: file.name,
      objectUrl,
      duration: audio.duration || 0,
    })

    // Set the audio ref for playback sync
    if (audioRef?.current) {
      audioRef.current.src = objectUrl
    }
  }, [setSoundtrack, audioRef])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [handleFile])

  const handleRemove = useCallback(() => {
    if (audioRef?.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
    }
    removeSoundtrack()
  }, [removeSoundtrack, audioRef])

  return (
    <div className="rm-soundtrack-panel">
      {!soundtrack ? (
        <div
          className={`rm-audio-drop ${dragging ? 'dragging' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
        >
          + Add audio
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="rm-soundtrack-info">
          <span>🎵 {soundtrack.name} ({formatDuration(soundtrack.duration)})</span>
          <button onClick={handleRemove}>×</button>
        </div>
      )}
    </div>
  )
}
