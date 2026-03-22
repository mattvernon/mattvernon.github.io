import { useEffect, useRef } from 'react'

export default function QrPreview({ qrCode, bgColor }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
      qrCode.append(containerRef.current)
    }
  }, [qrCode])

  return (
    <div
      className="qr-preview"
      ref={containerRef}
      style={{ background: bgColor }}
    />
  )
}
