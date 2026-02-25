import { useState } from 'react'
import { DOCK_APPS } from '../constants'
import useDesktopStore from '../store'

export default function Dock() {
  const openWindow = useDesktopStore((state) => state.openWindow)
  const windows = useDesktopStore((state) => state.windows)
  const [hoveredIndex, setHoveredIndex] = useState(null)

  const isAppRunning = (appId) =>
    windows.some((w) => w.appId === appId && !w.isMinimized)

  const getScale = (index) => {
    if (hoveredIndex === null) return 1
    const distance = Math.abs(index - hoveredIndex)
    if (distance === 0) return 1.5
    if (distance === 1) return 1.25
    if (distance === 2) return 1.1
    return 1
  }

  return (
    <div className="dock-container">
      <div
        className="dock"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {DOCK_APPS.map((app, index) => {
          const scale = getScale(index)
          const running = isAppRunning(app.appId)

          return (
            <div
              key={app.appId}
              className="dock-item"
              onMouseEnter={() => setHoveredIndex(index)}
              onClick={() => openWindow(app.appId)}
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'bottom center',
                marginBottom: (scale - 1) * 24,
              }}
            >
              <div className="dock-tooltip">{app.label}</div>
              <div className="dock-icon">{app.icon}</div>
              {running && <div className="dock-indicator" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
