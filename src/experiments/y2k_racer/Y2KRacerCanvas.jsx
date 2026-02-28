import { useRef, useEffect } from 'react'
import GameEngine from './engine/GameEngine'
import useY2KRacerStore from './store'
import { getMapConfig } from './world/maps/index.js'

export default function Y2KRacerCanvas() {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const gameState = useY2KRacerStore((s) => s.gameState)
  const pauseGame = useY2KRacerStore((s) => s.pauseGame)

  // Boot engine on mount
  useEffect(() => {
    if (!canvasRef.current) return

    const engine = new GameEngine(canvasRef.current, {
      onHudUpdate: (speed, carX, carZ, carHeading) =>
        useY2KRacerStore.getState().updateHud(speed, carX, carZ, carHeading),
    })
    // Init with default NYC map
    engine.init(getMapConfig('nyc'))
    engineRef.current = engine

    canvasRef.current.focus()

    return () => {
      engine.dispose()
      engineRef.current = null
    }
  }, [])

  // React to game state changes
  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return

    if (gameState === 'playing') {
      const state = useY2KRacerStore.getState()
      const mapConfig = getMapConfig(state.selectedMap)

      // Swap map if it changed
      if (engine.currentMapConfig?.id !== mapConfig.id) {
        engine.swapMap(mapConfig)
      }

      engine.swapCarModel(state.selectedCar)
      engine.resume()
      canvasRef.current?.focus()
    } else if (gameState === 'paused') {
      engine.pause()
    } else if (gameState === 'menu') {
      engine.pause()
    }
  }, [gameState])

  // Listen for escape key to pause
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'Escape' && gameState === 'playing') {
        e.preventDefault()
        pauseGame()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [gameState, pauseGame])

  return (
    <canvas
      ref={canvasRef}
      className="racing-canvas"
      tabIndex={0}
    />
  )
}
