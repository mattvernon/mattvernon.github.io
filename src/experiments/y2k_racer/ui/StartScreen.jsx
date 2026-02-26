import { useRef, useEffect } from 'react'
import useY2KRacerStore from '../store'

const FONT = '"Barlow Condensed", "Arial Narrow", sans-serif'

function PixelatedGameLogo() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.src = '/y2kracer-logo.png'
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={167}
      height={56}
      className="game-logo"
    />
  )
}

function PixelatedPrompt() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.font = `700 19px ${FONT}`
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('PRESS ENTER TO START', canvas.width / 2, canvas.height / 2)
  }, [])

  // 250x24 canvas displayed at 750x72 (3x scale)
  return (
    <canvas
      ref={canvasRef}
      width={250}
      height={24}
      className="start-prompt-canvas"
    />
  )
}

export default function StartScreen() {
  const startGame = useY2KRacerStore((s) => s.startGame)

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
        <PixelatedGameLogo />
        <PixelatedPrompt />
      </div>
    </div>
  )
}
