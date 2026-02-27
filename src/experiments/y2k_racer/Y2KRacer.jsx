import { useEffect } from 'react'
import useY2KRacerStore from './store'
import Y2KRacerCanvas from './Y2KRacerCanvas'
import StartScreen from './ui/StartScreen'
import CarSelectScreen from './ui/CarSelectScreen'
import HUD from './ui/HUD'
import PauseOverlay from './ui/PauseOverlay'
import './Y2KRacer.css'

export default function Y2KRacer() {
  const gameState = useY2KRacerStore((s) => s.gameState)
  const returnToMenu = useY2KRacerStore((s) => s.returnToMenu)

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
      <Y2KRacerCanvas />
      {gameState === 'menu' && <StartScreen />}
      {gameState === 'carSelect' && <CarSelectScreen />}
      {gameState === 'playing' && <HUD />}
      {gameState === 'paused' && <PauseOverlay />}
    </div>
  )
}
