import { useEffect, useRef, useState, useCallback } from 'react'
import SpiralEngine from './SpiralEngine'
import ControlPanel from './ControlPanel'
import './CosmosSpiral.css'

// Collect all image URLs from cosmos_images subfolders
const IMAGE_FOLDERS = [
  'Artist Imagery',
  'Color, Materials & Texture',
  'Fashion & Editorial',
  'Food & Travel',
  'Graphic Design, Branding & Typography',
  'Illustration & Concept Art',
  'Interiors, Furniture & Architecture',
  'Nature Landscape & Places',
  'Product & Industrial Design',
  'Real Art (Paintings, Drawings, Sculptures, etc.)',
  'UI, UX & Digital Interfaces',
]

export default function CosmosSpiral() {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState({ loaded: 0, total: 0 })

  useEffect(() => {
    document.title = 'Cosmos Spiral'
    const prevOverflow = document.body.style.overflow
    const prevBg = document.body.style.backgroundColor
    document.body.style.overflow = 'hidden'
    document.body.style.backgroundColor = '#000'

    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.backgroundColor = prevBg
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    // Build image URL list by scanning known folder structure
    // We'll fetch the file listing via a manifest approach
    async function init() {
      const imageUrls = await discoverImages()
      const engine = new SpiralEngine(canvasRef.current, imageUrls)
      engine.onProgress = (loaded, total) => {
        setProgress({ loaded, total })
        if (loaded >= Math.min(20, total)) {
          setLoading(false)
        }
      }
      engineRef.current = engine
      setSettings({ ...engine.settings })
    }

    init()

    return () => {
      if (engineRef.current) {
        engineRef.current.dispose()
        engineRef.current = null
      }
    }
  }, [])

  const handleChange = useCallback((key, value) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value }
      if (engineRef.current) {
        engineRef.current.updateSettings({ [key]: value })
      }
      return next
    })
  }, [])

  const handleRandomize = useCallback(() => {
    if (!engineRef.current) return
    const randomSettings = engineRef.current.randomize()
    setSettings(prev => {
      const next = { ...prev, ...randomSettings }
      engineRef.current.updateSettings(randomSettings)
      return next
    })
  }, [])

  const handleReset = useCallback(() => {
    if (!engineRef.current) return
    const defaults = engineRef.current.getDefaults()
    setSettings({ ...defaults })
    engineRef.current.updateSettings(defaults)
    engineRef.current.animationOffset = 0
  }, [])

  return (
    <div className="cs-container">
      <canvas ref={canvasRef} className="cs-canvas" />
      {loading && (
        <div className="cs-loading">
          <div className="cs-loading-text">
            Loading images... {progress.loaded}/{progress.total || '?'}
          </div>
          <div className="cs-loading-bar">
            <div
              className="cs-loading-fill"
              style={{
                width: progress.total ? `${(progress.loaded / progress.total) * 100}%` : '0%'
              }}
            />
          </div>
        </div>
      )}
      {settings && (
        <ControlPanel
          settings={settings}
          onChange={handleChange}
          onRandomize={handleRandomize}
          onReset={handleReset}
        />
      )}
    </div>
  )
}

async function discoverImages() {
  // We need to build the list of image paths. Since Vite serves from /public,
  // we'll use import.meta.glob to discover them at build time.
  // However, since they're in /public, we need to reference them by URL.
  // We'll fetch a generated manifest or hardcode the folder scan.

  // Use a fetch to the folders - but since we can't list directories via fetch,
  // we'll generate a manifest at build time. For now, let's use a pragmatic approach:
  // fetch a small script that returns the file listing.

  // Simplest approach: use Vite's import.meta.glob for public folder images
  // Actually, import.meta.glob doesn't work on /public. Let's generate a manifest.

  try {
    const response = await fetch('/cosmos_thumbs/manifest.json')
    if (response.ok) {
      const files = await response.json()
      return files
    }
  } catch (e) {
    // Fall through
  }

  // Fallback: try to load images from known patterns
  return generateFallbackUrls()
}

function generateFallbackUrls() {
  // We'll need to generate this list. For now return empty and rely on manifest.
  console.warn('No manifest found. Run the generate-manifest script.')
  return []
}
