import useQrStore from '../store'

function ColorField({ label, color, onChange }) {
  return (
    <div className="qr-color-field" onClick={() => document.getElementById(`qr-color-${label}`).click()}>
      <div className="qr-color-swatch" style={{ background: color }}>
        <input
          id={`qr-color-${label}`}
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <div className="qr-color-info">
        <span className="qr-color-name">{label}</span>
        <span className="qr-color-hex">{color}</span>
      </div>
    </div>
  )
}

export default function ColorPicker() {
  const bgColor = useQrStore((s) => s.bgColor)
  const codeColor = useQrStore((s) => s.codeColor)
  const setBgColor = useQrStore((s) => s.setBgColor)
  const setCodeColor = useQrStore((s) => s.setCodeColor)

  return (
    <div className="qr-section">
      <div className="qr-section-label">Colors</div>
      <div className="qr-colors">
        <ColorField label="Background" color={bgColor} onChange={setBgColor} />
        <ColorField label="Code" color={codeColor} onChange={setCodeColor} />
      </div>
    </div>
  )
}
