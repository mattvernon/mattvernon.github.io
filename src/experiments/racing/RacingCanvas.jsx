import { useRef, useEffect } from 'react'
import GameEngine from './engine/GameEngine'
import useRacingStore from './store'

export default function RacingCanvas() {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const gameState = useRacingStore((s) => s.gameState)
  const updateSpeed = useRacingStore((s) => s.updateSpeed)
  const pauseGame = useRacingStore((s) => s.pauseGame)

  // Boot engine on mount
  useEffect(() => {
    if (!canvasRef.current) return

    const engine = new GameEngine(canvasRef.current, {
      onSpeedUpdate: (speed) => useRacingStore.getState().updateSpeed(speed),
    })
    engine.init()
    engineRef.current = engine

    // Focus canvas for keyboard input
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
