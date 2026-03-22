import useQrStore from '../store'

const STYLES = [
  { id: 'square', label: 'Square' },
  { id: 'dots', label: 'Dots' },
  { id: 'rounded', label: 'Rounded' },
]

function StyleIcon({ type }) {
  const cells = Array.from({ length: 9 })
  return (
    <div className={`qr-style-icon qr-style-icon--${type}`}>
      {cells.map((_, i) => <span key={i} />)}
    </div>
  )
}

export default function StylePicker() {
  const pixelStyle = useQrStore((s) => s.pixelStyle)
  const setPixelStyle = useQrStore((s) => s.setPixelStyle)

  return (
    <div className="qr-section">
      <div className="qr-section-label">Pixel Style</div>
      <div className="qr-styles">
        {STYLES.map((s) => (
          <button
            key={s.id}
            className={`qr-style-btn${pixelStyle === s.id ? ' qr-style-btn--active' : ''}`}
            onClick={() => setPixelStyle(s.id)}
          >
            <StyleIcon type={s.id} />
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
