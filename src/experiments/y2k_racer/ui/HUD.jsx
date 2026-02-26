import { useRef, useEffect } from 'react'
import Speedometer from './Speedometer'

function PixelatedLogo() {
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

  // Render at 120x40, displayed at 360x121 via CSS (3x scale)
  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={40}
      className="hud-watermark"
    />
  )
}

export default function HUD() {
  return (
    <div className="hud">
      <PixelatedLogo />
      <Speedometer />
    </div>
  )
}
