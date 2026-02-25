import { forwardRef } from 'react'
import useDesktopStore from '../store'

const TitleBar = forwardRef(({ window: win, isFocused }, ref) => {
  const closeWindow = useDesktopStore((s) => s.closeWindow)
  const minimizeWindow = useDesktopStore((s) => s.minimizeWindow)

  const handleClose = (e) => {
    e.stopPropagation()
    closeWindow(win.id)
  }

  const handleMinimize = (e) => {
    e.stopPropagation()
    minimizeWindow(win.id)
  }

  const handleMaximize = (e) => {
    e.stopPropagation()
    // Could implement maximize later
  }

  return (
    <div ref={ref} className={`title-bar ${isFocused ? 'focused' : ''}`}>
      <div className="traffic-lights">
        <button className="traffic-light close" onClick={handleClose} aria-label="Close" />
        <button className="traffic-light minimize" onClick={handleMinimize} aria-label="Minimize" />
        <button className="traffic-light maximize" onClick={handleMaximize} aria-label="Maximize" />
      </div>
      <div className="title-text">{win.title}</div>
    </div>
  )
})

TitleBar.displayName = 'TitleBar'
export default TitleBar
