import { useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'
import useQrStore from './store'
import QrPreview from './components/QrPreview'
import UrlInput from './components/UrlInput'
import StylePicker from './components/StylePicker'
import DensityPicker from './components/DensityPicker'
import PaddingSlider from './components/PaddingSlider'
import ColorPicker from './components/ColorPicker'
import LogoUpload from './components/LogoUpload'
import ActionBar from './components/ActionBar'
import './QrCode.css'

export default function QrCode() {
  const { url, pixelStyle, bgColor, codeColor, logoDataUrl, padding, density } = useQrStore()

  const qrRef = useRef(
    new QRCodeStyling({
      width: 300,
      height: 300,
      data: 'https://mattvernon.me',
      type: 'svg',
      dotsOptions: { color: '#1a0a4a', type: 'square' },
      backgroundOptions: { color: '#FFFFFF' },
      cornersSquareOptions: { type: 'square', color: '#1a0a4a' },
      cornersDotOptions: { type: 'square', color: '#1a0a4a' },
      qrOptions: { errorCorrectionLevel: 'M' },
      imageOptions: { crossOrigin: 'anonymous', margin: 8, imageSize: 0.35 },
    })
  )

  useEffect(() => {
    document.title = 'QR Code Generator'
    document.body.style.overflow = 'hidden'
    document.body.style.margin = '0'
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', '#4338CA')
    return () => {
      document.title = ''
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    const cornerType = pixelStyle === 'dots' ? 'dot' : pixelStyle === 'rounded' ? 'extra-rounded' : 'square'
    const cornerDotType = pixelStyle === 'dots' ? 'dot' : 'square'

    // Density maps to error correction level (more correction = denser QR)
    // When logo is present, always use at least 'Q' for scannability
    const densityMap = { low: 'L', medium: 'M', high: 'Q' }
    const ecl = logoDataUrl
      ? (density === 'high' ? 'H' : 'Q')
      : densityMap[density]

    qrRef.current.update({
      data: url || 'https://mattvernon.me',
      margin: padding,
      dotsOptions: { color: codeColor, type: pixelStyle },
      backgroundOptions: { color: bgColor },
      cornersSquareOptions: { type: cornerType, color: codeColor },
      cornersDotOptions: { type: cornerDotType, color: codeColor },
      image: logoDataUrl || undefined,
      qrOptions: { errorCorrectionLevel: ecl },
    })
  }, [url, pixelStyle, bgColor, codeColor, logoDataUrl, padding, density])

  return (
    <div className="qr-app">
      <div className="qr-scroll">
        <h1 className="qr-title">QR Code</h1>
        <QrPreview qrCode={qrRef.current} bgColor={bgColor} />
        <div className="qr-controls">
          <UrlInput />
          <StylePicker />
          <DensityPicker />
          <PaddingSlider />
          <ColorPicker />
          <LogoUpload />
        </div>
      </div>
      <ActionBar qrCode={qrRef.current} />
    </div>
  )
}
