import { useEffect, useRef, useCallback, useState } from 'react'
import useMoodboardStore from './store'
import { parseUsername, cosmosImageUrl } from './cosmosApi'
import './Moodboard.css'

const CosmosLogo = ({ className }) => (
  <svg className={className} viewBox="0 0 89.401 100" fill="currentColor">
    <ellipse cx="10.442" cy="10.442" rx="10.442" ry="10.442" transform="translate(34.259)" />
    <ellipse cx="10.442" cy="10.442" rx="10.442" ry="10.442" transform="translate(34.259 79.117)" />
    <ellipse cx="10.442" cy="10.442" rx="10.442" ry="10.442" transform="translate(0 19.779)" />
    <ellipse cx="10.442" cy="10.442" rx="10.442" ry="10.442" transform="translate(68.518 59.337)" />
    <ellipse cx="10.442" cy="10.442" rx="10.442" ry="10.442" transform="translate(68.518 19.779)" />
    <ellipse cx="10.442" cy="10.442" rx="10.442" ry="10.442" transform="translate(0 59.337)" />
  </svg>
)

export default function Moodboard() {
  const containerRef = useRef(null)
  const searchRef = useRef(null)
  const {
    viewport, elements, selectedId, profileUsername, profileUser,
    isLoading, error,
    pan, zoom, moveElement, selectElement,
    fitToView, bringToFront, loadProfile, clearError,
  } = useMoodboardStore()

  const [dragState, setDragState] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [modalId, setModalId] = useState(null)
  const [hiResLoaded, setHiResLoaded] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  // Load default profile on mount
  useEffect(() => {
    document.title = 'Moodboard — Infinite Canvas'
    const prevBg = document.body.style.backgroundColor
    document.body.style.backgroundColor = '#08080c'
    loadProfile('andy')
    return () => { document.body.style.backgroundColor = prevBg }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-dismiss error
  useEffect(() => {
    if (!error) return
    const t = setTimeout(clearError, 4000)
    return () => clearTimeout(t)
  }, [error, clearError])

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setModalId(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Smooth zoom with wheel
  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const scaleFactor = Math.pow(0.998, e.deltaY)
    const newZoom = viewport.zoom * scaleFactor
    zoom(newZoom, e.clientX, e.clientY)
  }, [viewport.zoom, zoom])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const handlePointerDown = useCallback((e) => {
    if (e.button !== 0 || modalId) return
    if (e.target.closest('.mb-toolbar, .mb-modal-backdrop, .mb-loading-overlay')) return

    const elementId = e.target.closest('[data-element-id]')?.dataset.elementId

    if (elementId) {
      bringToFront(elementId)
      setDragState({
        type: 'element',
        startX: e.clientX,
        startY: e.clientY,
        elementId,
        hasMoved: false,
      })
    } else {
      setDragState({
        type: 'pan',
        startX: e.clientX,
        startY: e.clientY,
        hasMoved: false,
      })
    }

    containerRef.current?.setPointerCapture(e.pointerId)
  }, [bringToFront, modalId])

  const handlePointerMove = useCallback((e) => {
    if (!dragState) return

    const dx = e.clientX - dragState.startX
    const dy = e.clientY - dragState.startY

    if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return

    setDragState((prev) => ({ ...prev, startX: e.clientX, startY: e.clientY, hasMoved: true }))

    if (dragState.type === 'pan') {
      pan(dx, dy)
    } else if (dragState.type === 'element') {
      moveElement(dragState.elementId, dx / viewport.zoom, dy / viewport.zoom)
    }
  }, [dragState, pan, moveElement, viewport.zoom])

  const handlePointerUp = useCallback(() => {
    if (dragState?.type === 'element' && !dragState.hasMoved) {
      setHiResLoaded(false)
      setModalId(dragState.elementId)
    }
    setDragState(null)
  }, [dragState])

  const handleSearch = useCallback((e) => {
    e.preventDefault()
    const username = parseUsername(searchValue)
    if (!username) return
    setSearchValue('')
    searchRef.current?.blur()
    setModalId(null)
    loadProfile(username)
  }, [searchValue, loadProfile])

  const cursorStyle = dragState ? 'grabbing' : 'default'

  return (
    <div
      className="mb-container"
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ cursor: cursorStyle }}
    >
      {/* Canvas */}
      <div
        className={`mb-canvas ${isAnimating ? 'mb-canvas--animating' : ''}`}
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        }}
      >
        {elements.map((el) => (
          <div
            key={el.id}
            data-element-id={el.id}
            className={`mb-card ${selectedId === el.id ? 'mb-card--selected' : ''}`}
            style={{
              left: el.x,
              top: el.y,
              width: el.width,
            }}
          >
            <div className="mb-card-image">
              <img
                src={el.imageUrl}
                alt={el.title}
                draggable={false}
                loading="lazy"
                referrerPolicy="no-referrer"
                style={{ height: el.height }}
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.classList.add('mb-card-image--error')
                }}
              />
            </div>
            <div className="mb-card-info">
              <span className="mb-card-title">{el.title}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <form className="mb-toolbar" onSubmit={handleSearch}>
        <CosmosLogo className="mb-toolbar-logo" />
        <div className="mb-toolbar-center">
          <span className="mb-toolbar-prefix">cosmos.so/</span>
          <input
            ref={searchRef}
            className="mb-search-input"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={profileUsername}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
        <button type="submit" className="mb-toolbar-submit" aria-label="Load profile">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <path d="M9.29297 0.292969C9.68349 -0.0975556 10.3165 -0.0975556 10.707 0.292969L15.707 5.29297C15.7548 5.34078 15.7976 5.39354 15.835 5.4502C15.8597 5.48768 15.8812 5.52661 15.9004 5.56641C15.9222 5.61159 15.9412 5.65838 15.9561 5.70703C15.9623 5.72732 15.9668 5.74798 15.9717 5.76855C15.9893 5.84291 16 5.92025 16 6C16 6.083 15.9878 6.16312 15.9688 6.24023C15.9646 6.25717 15.9611 6.27428 15.9561 6.29102C15.9412 6.34001 15.9223 6.38712 15.9004 6.43262C15.8804 6.47428 15.8572 6.51458 15.8311 6.55371C15.8185 6.57256 15.8048 6.59048 15.791 6.6084C15.7649 6.6422 15.738 6.67604 15.707 6.70703L10.707 11.707C10.3165 12.0975 9.68348 12.0975 9.29297 11.707C8.90246 11.3165 8.90248 10.6835 9.29297 10.293L12.5859 7H1C0.44774 7 4.07147e-05 6.55225 0 6C0 5.44772 0.447715 5 1 5H12.5859L9.29297 1.70703C8.90246 1.31652 8.90248 0.683496 9.29297 0.292969Z" fill="currentColor"/>
          </svg>
        </button>
      </form>
      {error && <div className="mb-toolbar-error">{error}</div>}

      {/* Loading overlay */}
      {isLoading && (
        <div className="mb-loading-overlay">
          <CosmosLogo className="mb-cosmos-spin mb-loading-logo" />
        </div>
      )}

      {/* Modal */}
      {modalId && (() => {
        const el = elements.find((e) => e.id === modalId)
        if (!el) return null
        const hiResUrl = el.imageUuid
          ? cosmosImageUrl(el.imageUuid, 1080)
          : el.imageUrl.replace(/w=\d+/, 'w=1080')
        return (
          <div className="mb-modal-backdrop" onClick={() => setModalId(null)}>
            <div className="mb-modal">
              <div className="mb-modal-title">{el.title}</div>
              <div className="mb-modal-image-wrap">
                <img
                  className="mb-modal-img-lo"
                  src={el.imageUrl}
                  alt={el.title}
                  referrerPolicy="no-referrer"
                />
                <img
                  className={`mb-modal-img-hi ${hiResLoaded ? 'mb-modal-img-hi--loaded' : ''}`}
                  src={hiResUrl}
                  alt={el.title}
                  referrerPolicy="no-referrer"
                  onLoad={() => setHiResLoaded(true)}
                  onError={() => setHiResLoaded(true)}
                />
                {!hiResLoaded && (
                  <div className="mb-modal-spinner">
                    <CosmosLogo className="mb-cosmos-spin" />
                  </div>
                )}
              </div>
              <a
                href={`https://www.cosmos.so/e/${el.cosmosId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-modal-cosmos-link"
                onClick={(e) => e.stopPropagation()}
              >
                <CosmosLogo className="mb-cosmos-logo-sm" />
                View on Cosmos
              </a>
            </div>
          </div>
        )
      })()}

    </div>
  )
}
