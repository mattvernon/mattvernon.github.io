import { useState, useEffect } from 'react'
import useDesktopStore from '../store'

export default function MenuBar() {
  const [time, setTime] = useState(new Date())
  const focusedWindowId = useDesktopStore((s) => s.focusedWindowId)
  const windows = useDesktopStore((s) => s.windows)
  const openWindow = useDesktopStore((s) => s.openWindow)

  const focusedWindow = windows.find((w) => w.id === focusedWindowId)
  const appName = focusedWindow ? focusedWindow.title : 'Finder'

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const timeString = `${dayNames[time.getDay()]} ${monthNames[time.getMonth()]} ${time.getDate()}  ${time.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })}`

  const handleAppleClick = () => {
    openWindow('about')
  }

  return (
    <div className="menu-bar">
      <div className="menu-bar-left">
        <div className="menu-item apple-menu" onClick={handleAppleClick}>
          <svg width="14" height="17" viewBox="0 0 814 1000" fill="currentColor">
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4c-58.3-81.3-105.9-207.6-105.9-328.3 0-193 125.4-295.5 248.7-295.5 65.6 0 120.3 43.1 161.4 43.1 39.1 0 100-45.8 174.5-45.8 28.2 0 129.6 2.6 196.9 99.9zM554.1 159.4c31.1-36.9 53.1-88.1 53.1-139.4 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.2 31.7-56.4 82.9-56.4 135.1 0 7.8.6 15.6 1.3 18.2 2.6.6 6.4 1.3 10.2 1.3 45.4-.1 102.5-30.4 140.8-70.9z"/>
          </svg>
        </div>
        <div className="menu-item app-name">{appName}</div>
        <div className="menu-item disabled">File</div>
        <div className="menu-item disabled">Edit</div>
        <div className="menu-item disabled">View</div>
        <div className="menu-item disabled">Help</div>
      </div>
      <div className="menu-bar-right">
        <div className="menu-item time">{timeString}</div>
      </div>
    </div>
  )
}
