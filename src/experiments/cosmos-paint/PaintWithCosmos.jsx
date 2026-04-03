import { useEffect, useRef, useState, useCallback } from 'react'
import {
  parseCollectionUrl,
  fetchCollectionImages,
  preloadImages,
} from './cosmosCollectionApi'
import './PaintWithCosmos.css'
import logoSvg from './paintwith.svg'

const SPAWN_DISTANCE = 50
const SPAWN_INTERVAL = 80
const MAX_IMAGES = 40
const IMAGE_LIFETIME = 2200 // slightly longer than animation (2s)
const DEFAULT_COLLECTION = { username: 'dappboi', slug: 'art1' }

export default function PaintWithCosmos() {
  const [inputValue, setInputValue] = useState(
    `cosmos.so/${DEFAULT_COLLECTION.username}/${DEFAULT_COLLECTION.slug}`,
  )
  const [elements, setElements] = useState([])
  const [painted, setPainted] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isPainting, setIsPainting] = useState(false)

  const indexRef = useRef(0)
  const nextIdRef = useRef(0)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const lastTimeRef = useRef(0)
  const elementsRef = useRef([])
  const paintedRef = useRef([])

  // Keep refs in sync
  useEffect(() => { elementsRef.current = elements }, [elements])
  useEffect(() => { paintedRef.current = painted }, [painted])

  useEffect(() => {
    document.title = 'Paint with Cosmos'
    document.body.style.overflow = 'hidden'
    document.body.style.margin = '0'
    document.body.style.backgroundColor = '#08080c'
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', '#08080c')

    return () => {
      document.body.style.overflow = ''
      document.body.style.backgroundColor = ''
    }
  }, [])

  // Auto-load default collection on mount
  const loadCollection = useCallback(
    async (username, slug) => {
      setLoading(true)
      setError(null)
      try {
        const { elements: imgs } = await fetchCollectionImages(username, slug)
        if (imgs.length === 0) {
          setError('No images found in this collection')
          setLoading(false)
          return
        }
        const validImgs = await preloadImages(imgs)
        if (validImgs.length === 0) {
          setError('No loadable images found in this collection')
          setLoading(false)
          return
        }
        setElements(validImgs)
        setPainted([])
        indexRef.current = 0
        lastPosRef.current = { x: 0, y: 0 }
        lastTimeRef.current = 0
        setIsPainting(true)
      } catch (err) {
        setError(err.message || 'Failed to load collection')
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    loadCollection(DEFAULT_COLLECTION.username, DEFAULT_COLLECTION.slug)
  }, [loadCollection])

  // Cleanup expired painted images
  useEffect(() => {
    if (!isPainting) return
    const interval = setInterval(() => {
      const now = Date.now()
      setPainted((prev) => prev.filter((img) => now - img.createdAt < IMAGE_LIFETIME))
    }, 2000)
    return () => clearInterval(interval)
  }, [isPainting])

  const spawnImage = useCallback((x, y) => {
    const els = elementsRef.current
    if (els.length === 0) return

    const el = els[indexRef.current % els.length]
    indexRef.current++

    const size = 180 + Math.random() * 140
    const rotation = (Math.random() - 0.5) * 30
    const width = size
    const height = size / (el.aspectRatio || 1)

    const newImg = {
      id: nextIdRef.current++,
      x,
      y,
      url: el.imageUrl,
      width,
      height,
      rotation,
      createdAt: Date.now(),
    }

    setPainted((prev) => {
      const next = [...prev, newImg]
      return next.length > MAX_IMAGES ? next.slice(-MAX_IMAGES) : next
    })
  }, [])

  const loadingRef = useRef(false)
  useEffect(() => { loadingRef.current = loading }, [loading])

  const handlePointerMove = useCallback(
    (e) => {
      if (!isPainting || loadingRef.current || elementsRef.current.length === 0) return

      const x = e.clientX
      const y = e.clientY
      const now = Date.now()

      const dx = x - lastPosRef.current.x
      const dy = y - lastPosRef.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const elapsed = now - lastTimeRef.current

      if (dist >= SPAWN_DISTANCE && elapsed >= SPAWN_INTERVAL) {
        lastPosRef.current = { x, y }
        lastTimeRef.current = now
        spawnImage(x, y)
      }
    },
    [isPainting, spawnImage],
  )

  const handleTouchMove = useCallback(
    (e) => {
      if (!isPainting || loadingRef.current || elementsRef.current.length === 0) return
      e.preventDefault()
      const touch = e.touches[0]
      if (!touch) return

      const x = touch.clientX
      const y = touch.clientY
      const now = Date.now()

      const dx = x - lastPosRef.current.x
      const dy = y - lastPosRef.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const elapsed = now - lastTimeRef.current

      if (dist >= SPAWN_DISTANCE && elapsed >= SPAWN_INTERVAL) {
        lastPosRef.current = { x, y }
        lastTimeRef.current = now
        spawnImage(x, y)
      }
    },
    [isPainting, spawnImage],
  )

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      setError(null)

      const parsed = parseCollectionUrl(inputValue)
      if (!parsed) {
        setError('Enter a valid Cosmos collection URL (e.g. cosmos.so/user/collection)')
        return
      }

      loadCollection(parsed.username, parsed.slug)
    },
    [inputValue, loadCollection],
  )

  return (
    <div
      className="cp-container"
      onMouseMove={handlePointerMove}
      onTouchMove={handleTouchMove}
    >
      {/* Paint area */}
      <div className="cp-paint-area">
        {painted.map((img) => (
          <img
            key={img.id}
            className="cp-painted-img"
            src={img.url}
            alt=""
            style={{
              left: img.x,
              top: img.y,
              width: img.width,
              height: img.height,
              '--rot': `${img.rotation}deg`,
            }}
            draggable={false}
          />
        ))}
      </div>

      {/* Logo */}
      <img className="cp-logo" src={logoSvg} alt="Paint with Cosmos" draggable={false} />

      {/* Toolbar */}
      <form className="cp-toolbar" onSubmit={handleSubmit}>
        <svg className="cp-toolbar-icon" width="16" height="18" viewBox="0 0 22 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.0145 6.89416C12.9228 6.89416 14.4706 5.35188 14.4706 3.44708C14.4706 1.54228 12.9243 0 11.0145 0C9.10466 0 7.55832 1.54228 7.55832 3.44708C7.55832 5.35188 9.10466 6.89416 11.0145 6.89416Z" fill="currentColor"/>
          <path d="M11.0145 24.3036C12.9228 24.3036 14.4706 22.7613 14.4706 20.8565C14.4706 18.9517 12.9243 17.4094 11.0145 17.4094C9.10466 17.4094 7.55832 18.9517 7.55832 20.8565C7.55832 22.7613 9.10466 24.3036 11.0145 24.3036Z" fill="currentColor"/>
          <path d="M3.45617 11.2462C5.3645 11.2462 6.91232 9.70393 6.91232 7.79913C6.91232 5.89433 5.36598 4.35205 3.45617 4.35205C1.54637 4.35205 3.05176e-05 5.89581 3.05176e-05 7.80098C3.05176e-05 9.70615 1.54637 11.2481 3.45617 11.2481V11.2466V11.2462Z" fill="currentColor"/>
          <path d="M18.5728 19.9515C20.4811 19.9515 22.0289 18.4093 22.0289 16.5045C22.0289 14.5997 20.4826 13.0574 18.5728 13.0574C16.663 13.0574 15.1166 14.5997 15.1166 16.5045C15.1166 18.4093 16.663 19.9515 18.5728 19.9515Z" fill="currentColor"/>
          <path d="M18.5728 11.2467C20.4811 11.2467 22.0289 9.70442 22.0289 7.79962C22.0289 5.89482 20.4826 4.35254 18.5728 4.35254C16.663 4.35254 15.1166 5.89482 15.1166 7.79962C15.1166 9.70442 16.663 11.2467 18.5728 11.2467Z" fill="currentColor"/>
          <path d="M3.45617 19.9512C5.3645 19.9512 6.91232 18.4089 6.91232 16.5041C6.91232 14.5993 5.36598 13.057 3.45617 13.057C1.54637 13.057 3.05176e-05 14.6026 3.05176e-05 16.5056C3.05176e-05 18.4085 1.54637 19.9526 3.45617 19.9526V19.9512Z" fill="currentColor"/>
        </svg>
        <input
          className="cp-toolbar-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Paste a Cosmos collection URL..."
          autoFocus
          disabled={loading}
        />
        <button
          className="cp-toolbar-submit"
          type="submit"
          disabled={loading || !inputValue.trim()}
          aria-label="Load collection"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </form>

      {/* Error */}
      {error && <div className="cp-error">{error}</div>}

      {/* Loading */}
      {loading && (
        <div className="cp-loading">
          <div className="cp-spinner" />
          <span className="cp-loading-text">Loading collection...</span>
        </div>
      )}

      {/* Hint */}
      {isPainting && painted.length === 0 && (
        <div className="cp-hint">Move your mouse to paint</div>
      )}
    </div>
  )
}
