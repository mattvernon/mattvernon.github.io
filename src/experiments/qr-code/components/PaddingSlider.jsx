import useQrStore from '../store'

export default function PaddingSlider() {
  const padding = useQrStore((s) => s.padding)
  const setPadding = useQrStore((s) => s.setPadding)

  return (
    <div className="qr-section">
      <div className="qr-section-label">Padding</div>
      <div className="qr-slider-row">
        <input
          className="qr-slider"
          type="range"
          min={0}
          max={30}
          step={1}
          value={padding}
          onChange={(e) => setPadding(Number(e.target.value))}
        />
        <span className="qr-slider-value">{padding}px</span>
      </div>
    </div>
  )
}
