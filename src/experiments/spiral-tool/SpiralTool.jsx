import { useEffect } from 'react'
import PasswordGate from '../../components/PasswordGate'

const PW_HASH = 'dd23e160dc4d5d23765b99ca97dceb4758f8a46885a7c7c84b25c117a0ceb8e7'

export default function SpiralTool() {
  useEffect(() => {
    document.title = 'Spiral Tool'
    document.body.style.backgroundColor = '#000'
    document.body.style.margin = '0'
    document.body.style.overflow = 'hidden'
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', '#000')
    return () => {
      document.body.style.backgroundColor = ''
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <PasswordGate hash={PW_HASH} slug="spiral-tool">
      <iframe
        src="/spiral-tool.html"
        title="Spiral Tool"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          background: '#f5f5f0',
        }}
      />
    </PasswordGate>
  )
}
