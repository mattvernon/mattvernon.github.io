import { useState, useEffect, useRef } from 'react'
import useY2KRacerStore from '../store'
import { CAR_MODELS } from '../vehicles/CarModel'
import CarPreviewCanvas from './CarPreviewCanvas'

const FONT = '"Barlow Condensed", "Arial Narrow", sans-serif'
const CAR_KEYS = Object.keys(CAR_MODELS)

function PixelatedText({ text, fontSize = 19, width = 250, height = 24, scale = 3 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.font = `700 ${fontSize}px ${FONT}`
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
  }, [text, fontSize])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width: width * scale,
        height: height * scale,
        imageRendering: 'pixelated',
        maxWidth: '100%',
      }}
    />
  )
}

export default function CarSelectScreen() {
  const [selectedIndex, setSelectedIndex] = useState(1)
  const selectCar = useY2KRacerStore((s) => s.selectCar)

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + CAR_KEYS.length) % CAR_KEYS.length)
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % CAR_KEYS.length)
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault()
        selectCar(CAR_KEYS[selectedIndex])
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedIndex, selectCar])

  return (
    <div className="car-select-screen">
      <div className="car-select-content">
        <div className="car-select-title">
          <PixelatedText text="SELECT YOUR RIDE" fontSize={22} width={280} height={28} scale={3} />
        </div>
        <div className="car-select-cards">
          {CAR_KEYS.map((key, i) => (
            <button
              key={key}
              className={`car-select-card ${i === selectedIndex ? 'car-select-card--active' : ''}`}
              onClick={() => {
                setSelectedIndex(i)
                selectCar(key)
              }}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <div className="car-select-card-preview">
                <CarPreviewCanvas modelKey={key} />
              </div>
              <div className="car-select-card-name">
                <PixelatedText
                  text={CAR_MODELS[key].name}
                  fontSize={11}
                  width={120}
                  height={14}
                  scale={2}
                />
              </div>
            </button>
          ))}
        </div>
        <div className="car-select-hint">
          <PixelatedText text="← →  BROWSE    ENTER  SELECT" fontSize={11} width={280} height={16} scale={2} />
        </div>
      </div>
    </div>
  )
}
