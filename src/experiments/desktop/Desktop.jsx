import { useEffect } from 'react'
import MenuBar from './components/MenuBar'
import DesktopArea from './components/DesktopArea'
import WindowFrame from './components/WindowFrame'
import Dock from './components/Dock'
import useDesktopStore from './store'
import './Desktop.css'

export default function Desktop() {
  const windows = useDesktopStore((state) => state.windows)
  const windowOrder = useDesktopStore((state) => state.windowOrder)

  useEffect(() => {
    const prevTitle = document.title
    document.title = 'mattOS'
    document.body.style.overflow = 'hidden'
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.userSelect = 'none'
    document.body.style.backgroundColor = '#306eba'

    return () => {
      document.title = prevTitle
      document.body.style.overflow = ''
      document.body.style.margin = ''
      document.body.style.padding = ''
      document.body.style.userSelect = ''
      document.body.style.backgroundColor = ''
    }
  }, [])

  return (
    <div className="aqua-desktop">
      <MenuBar />
      <DesktopArea />

      <Dock />

      {windowOrder.map((windowId, index) => {
        const win = windows.find((w) => w.id === windowId)
        if (!win || win.isMinimized) return null

        return (
          <WindowFrame key={win.id} window={win} zIndex={100 + index} />
        )
      })}
    </div>
  )
}
