import { useRef, useEffect } from 'react'
import DesktopIcon from './DesktopIcon'
import { DESKTOP_ICONS } from '../constants'
import useDesktopStore from '../store'

export default function DesktopArea() {
  const clearIconSelection = useDesktopStore((s) => s.clearIconSelection)
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Ensure autoplay works — some browsers need an explicit play() call
    const tryPlay = () => {
      video.play().catch(() => {
        // Autoplay blocked — silently fall back to gradient background
      })
    }

    if (video.readyState >= 3) {
      tryPlay()
    } else {
      video.addEventListener('canplay', tryPlay, { once: true })
      return () => video.removeEventListener('canplay', tryPlay)
    }
  }, [])

  const handleClick = () => {
    clearIconSelection()
  }

  return (
    <div className="desktop-area" onClick={handleClick}>
      <video
        ref={videoRef}
        className="desktop-wallpaper-video"
        src="/wallpaper.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      />
      <div className="desktop-icons">
        {DESKTOP_ICONS.map((item) => (
          <DesktopIcon key={item.appId} appId={item.appId} icon={item.icon} label={item.label} />
        ))}
      </div>
    </div>
  )
}
