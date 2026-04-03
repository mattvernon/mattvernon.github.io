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
const DEFAULT_COLLECTION = { username: 'dappboi', slug: 'design' }

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
        await preloadImages(imgs)
        setElements(imgs)
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
      const next = [newImg, ...prev]
      return next.length > MAX_IMAGES ? next.slice(0, MAX_IMAGES) : next
    })
  }, [])

  const handlePointerMove = useCallback(
    (e) => {
      if (!isPainting || elementsRef.current.length === 0) return

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
      if (!isPainting || elementsRef.current.length === 0) return
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
