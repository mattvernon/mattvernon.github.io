import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Canvas from './components/Canvas'
import WelcomeMessage from './components/WelcomeMessage'
import ColorPicker from './components/ColorPicker'
import LayoutEditor from './components/LayoutEditor'
import useHomeStore from './store'
import './Home.css'

const MOBILE_BREAKPOINT = 768

export default function Home() {
  const bgColor = useHomeStore((s) => s.bgColor)

  useEffect(() => {
    document.title = 'Matthew Vernon'
    const prevOverflow = document.body.style.overflow
    const prevBg = document.body.style.backgroundColor
    const prevMargin = document.body.style.margin

    document.body.style.overflow = 'hidden'
    document.body.style.margin = '0'

    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.backgroundColor = prevBg
      document.body.style.margin = prevMargin
    }
  }, [])

  useEffect(() => {
    document.body.style.backgroundColor = bgColor
  }, [bgColor])

  const isMobile = window.innerWidth <= MOBILE_BREAKPOINT

  return (
    <div className="hm-app">
      <Navbar variant="home" />
      <Canvas />
      {!isMobile && <WelcomeMessage />}
      <ColorPicker />
      <LayoutEditor />
    </div>
  )
}
