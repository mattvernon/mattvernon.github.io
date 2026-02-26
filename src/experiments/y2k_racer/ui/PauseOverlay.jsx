import useY2KRacerStore from '../store'
import { useEffect } from 'react'

export default function PauseOverlay() {
  const resumeGame = useY2KRacerStore((s) => s.resumeGame)
  const returnToMenu = useY2KRacerStore((s) => s.returnToMenu)

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Escape' || e.code === 'Enter') {
        e.preventDefault()
        resumeGame()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [resumeGame])

  return (
    <div className="pause-overlay">
      <div className="pause-content">
        <h2 className="pause-title">PAUSED</h2>
        <button className="pause-btn" onClick={resumeGame}>
          RESUME
        </button>
        <button className="pause-btn" onClick={returnToMenu}>
          QUIT
        </button>
      </div>
    </div>
  )
}
