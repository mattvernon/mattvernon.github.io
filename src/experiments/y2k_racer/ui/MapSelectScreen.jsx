import { useState, useEffect, useRef } from 'react'
import useY2KRacerStore from '../store'
import { MAP_LIST } from '../world/maps/index.js'
import MapPreviewCanvas from './MapPreviewCanvas'

const FONT = '"Barlow Condensed", "Arial Narrow", sans-serif'

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

const maps = MAP_LIST()

export default function MapSelectScreen() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectMap = useY2KRacerStore((s) => s.selectMap)

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + maps.length) % maps.length)
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % maps.length)
      } else if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault()
        selectMap(maps[selectedIndex].id)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedIndex, selectMap])

  return (
    <div className="map-select-screen">
      <div className="map-select-content">
        <div className="map-select-title">
          <PixelatedText text="SELECT YOUR CITY" fontSize={22} width={280} height={28} scale={3} />
        </div>
        <div className="map-select-cards">
          {maps.map((map, i) => (
            <button
              key={map.id}
              className={`map-select-card ${i === selectedIndex ? 'map-select-card--active' : ''}`}
              onClick={() => {
                setSelectedIndex(i)
                selectMap(map.id)
              }}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <div className="map-select-card-preview">
                <MapPreviewCanvas mapId={map.id} />
              </div>
              <div className="map-select-card-name">
                <PixelatedText
                  text={map.name.toUpperCase()}
                  fontSize={14}
                  width={160}
                  height={18}
                  scale={2}
                />
              </div>
              <div className="map-select-card-subtitle">
                <PixelatedText
                  text={map.subtitle}
                  fontSize={9}
                  width={160}
                  height={12}
                  scale={2}
                />
              </div>
            </button>
          ))}
        </div>
        <div className="map-select-hint">
          <PixelatedText text="← →  BROWSE    ENTER  SELECT" fontSize={11} width={280} height={16} scale={2} />
        </div>
      </div>
    </div>
  )
}
