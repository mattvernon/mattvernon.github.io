import useQrStore from '../store'

const DENSITIES = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
]

export default function DensityPicker() {
  const density = useQrStore((s) => s.density)
  const setDensity = useQrStore((s) => s.setDensity)

  return (
    <div className="qr-section">
      <div className="qr-section-label">Density</div>
      <div className="qr-styles">
        {DENSITIES.map((d) => (
          <button
            key={d.id}
            className={`qr-style-btn${density === d.id ? ' qr-style-btn--active' : ''}`}
            onClick={() => setDensity(d.id)}
          >
            <DensityIcon level={d.id} />
            <span>{d.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function DensityIcon({ level }) {
  const sizes = { low: 3, medium: 4, high: 5 }
  const count = sizes[level]
  const cellSize = level === 'high' ? 3 : level === 'medium' ? 4 : 5
  const gap = 2
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${count}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${count}, ${cellSize}px)`,
        gap: `${gap}px`,
      }}
    >
      {Array.from({ length: count * count }).map((_, i) => (
        <span
          key={i}
          style={{
            width: cellSize,
            height: cellSize,
            background: 'rgba(255,255,255,0.8)',
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  )
}
