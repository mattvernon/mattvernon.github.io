import useRacingStore from '../store'
import { useEffect } from 'react'

export default function StartScreen() {
  const startGame = useRacingStore((s) => s.startGame)

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault()
        startGame()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [startGame])

  return (
    <div className="start-screen">
      <div className="start-screen-content">
        <img
          src="/y2kracer-logo.png"
          alt="y2k racer"
          className="game-logo"
        />
        <p className="start-prompt">PRESS ENTER TO START</p>
        <div className="start-controls">
          <p>W / &#8593; &mdash; Accelerate</p>
          <p>S / &#8595; &mdash; Brake / Reverse</p>
          <p>A D / &#8592; &#8594; &mdash; Steer</p>
          <p>SPACE &mdash; Handbrake</p>
          <p>ESC &mdash; Pause</p>
        </div>
      </div>
    </div>
  )
}
