import { useRef } from 'react'
import TitleBar from './TitleBar'
import useWindowDrag from '../hooks/useWindowDrag'
import useWindowResize from '../hooks/useWindowResize'
import useDesktopStore from '../store'
import { APPS } from '../constants'
import Finder from '../apps/Finder'
import TextEdit from '../apps/TextEdit'
import AboutThisMac from '../apps/AboutThisMac'
import Browser from '../apps/Browser'
import Y2KRacer from '../apps/Y2KRacer'
import QuickTime from '../apps/QuickTime'

const APP_COMPONENTS = {
  finder: Finder,
  textedit: TextEdit,
  about: AboutThisMac,
  browser: Browser,
  y2kracer: Y2KRacer,
  quicktime: QuickTime,
}

export default function WindowFrame({ window: win, zIndex }) {
  const windowRef = useRef(null)
  const titleBarRef = useRef(null)
  const bringToFront = useDesktopStore((s) => s.bringToFront)
  const focusedWindowId = useDesktopStore((s) => s.focusedWindowId)

  const isFocused = win.id === focusedWindowId
  const app = APPS[win.appId]
  const AppComponent = APP_COMPONENTS[win.appId]

  useWindowDrag(win.id, titleBarRef, windowRef)
  useWindowResize(win.id, windowRef, app?.resizable)

  const handleMouseDown = () => {
    if (!isFocused) {
      bringToFront(win.id)
    }
  }

  return (
    <div
      ref={windowRef}
      className={`window-frame ${isFocused ? 'focused' : ''}`}
      style={{
        left: win.position.x,
        top: win.position.y,
        width: win.size.w,
        height: win.size.h,
        zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      <TitleBar ref={titleBarRef} window={win} isFocused={isFocused} />
      <div className="window-content">
        {AppComponent && <AppComponent />}
      </div>
      {app?.resizable && (
        <>
          <div className="resize-handle resize-se" data-direction="se" />
          <div className="resize-handle resize-sw" data-direction="sw" />
          <div className="resize-handle resize-ne" data-direction="ne" />
          <div className="resize-handle resize-nw" data-direction="nw" />
        </>
      )}
    </div>
  )
}
