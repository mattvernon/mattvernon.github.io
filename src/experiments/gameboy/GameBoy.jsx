import { useEffect, useState } from 'react'
import useEmulator from './useEmulator'
import GameBoyBezel from './GameBoyBezel'
import './GameBoy.css'

export default function GameBoy() {
  const { canvasRef, status, error, init, play } = useEmulator()
  const [started, setStarted] = useState(false)

  useEffect(() => {
    document.title = 'GameBoy Color'
    document.body.style.overflow = 'hidden'
    document.body.style.backgroundColor = '#E8E532'
    document.body.style.margin = '0'

    return () => {
      document.body.style.overflow = ''
      document.body.style.backgroundColor = ''
      document.body.style.margin = ''
    }
  }, [])

  useEffect(() => {
    init()
  }, [init])

  const handleStart = async () => {
    setStarted(true)
    await play()
  }

  return (
    <div className="gb-container">
      <div className="gb-device">
        <GameBoyBezel className="gb-bezel" />
        <canvas
          ref={canvasRef}
          className="gb-canvas"
          width={160}
          height={144}
        />

        {status === 'loading' && (
          <div className="gb-overlay gb-overlay--loading">
            <div className="gb-spinner" />
            <span className="gb-overlay-text">Loading...</span>
          </div>
        )}

        {status === 'ready' && !started && (
          <div className="gb-overlay gb-overlay--start" onClick={handleStart}>
            <span className="gb-overlay-text">Press to Start</span>
            <span className="gb-overlay-subtext">Click or tap anywhere</span>
          </div>
        )}

        {status === 'error' && (
          <div className="gb-overlay gb-overlay--error">
            <span className="gb-overlay-text">Error</span>
            <span className="gb-overlay-subtext">{error}</span>
          </div>
        )}
      </div>

      <div className="gb-controls-hint">
        Arrows: D-Pad &middot; Z: B &middot; X: A &middot; Enter: Start &middot; Shift: Select
      </div>
    </div>
  )
}
