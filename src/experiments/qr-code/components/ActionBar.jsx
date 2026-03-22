import useQrStore from '../store'

export default function ActionBar({ qrCode }) {
  const randomize = useQrStore((s) => s.randomize)

  const handleDownload = () => {
    qrCode.download({ name: 'qr-code', extension: 'svg' })
  }

  return (
    <div className="qr-action-bar">
      <button className="qr-btn qr-btn--secondary" onClick={randomize} aria-label="Randomize">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 3 21 3 21 8" />
          <line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" />
          <line x1="15" y1="15" x2="21" y2="21" />
          <line x1="4" y1="4" x2="9" y2="9" />
        </svg>
      </button>
      <button className="qr-btn qr-btn--primary" onClick={handleDownload}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Download SVG
      </button>
    </div>
  )
}
