import { useRef } from 'react'
import useQrStore from '../store'

export default function LogoUpload() {
  const logoDataUrl = useQrStore((s) => s.logoDataUrl)
  const setLogo = useQrStore((s) => s.setLogo)
  const clearLogo = useQrStore((s) => s.clearLogo)
  const inputRef = useRef(null)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (file) setLogo(file)
    e.target.value = ''
  }

  return (
    <div className="qr-section">
      <div className="qr-section-label">Logo</div>
      <div className="qr-logo-area">
        <button className="qr-logo-btn" onClick={() => inputRef.current?.click()}>
          {logoDataUrl ? 'Change Logo' : 'Upload Logo'}
        </button>
        <input
          ref={inputRef}
          className="qr-logo-input"
          type="file"
          accept="image/*"
          onChange={handleFile}
        />
        {logoDataUrl && (
          <div className="qr-logo-preview">
            <img className="qr-logo-thumb" src={logoDataUrl} alt="Logo" />
            <button className="qr-logo-remove" onClick={clearLogo} aria-label="Remove logo">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
