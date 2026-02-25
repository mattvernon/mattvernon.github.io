import { useEffect } from 'react'
import useRacingStore from './store'
import RacingCanvas from './RacingCanvas'
import StartScreen from './ui/StartScreen'
import HUD from './ui/HUD'
import PauseOverlay from './ui/PauseOverlay'
import './Racing.css'

export default function Racing() {
  const gameState = useRacingStore((s) => s.gameState)
  const returnToMenu = useRacingStore((s) => s.returnToMenu)

  useEffect(() => {
    document.title = 'y2k racer'
    const prevOverflow = document.body.style.overflow
    const prevBg = document.body.style.backgroundColor
    document.body.style.overflow = 'hidden'
    document.body.style.backgroundColor = '#000'

    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.backgroundColor = prevBg
      // Reset store on unmount
      returnToMenu()
    }
  }, [])

  return (
    <div className="racing-container">
      <RacingCanvas />
      {gameState === 'menu' && <StartScreen />}
      {gameState === 'playing' && <HUD />}
      {gameState === 'paused' && <PauseOverlay />}
    </div>
  )
}
