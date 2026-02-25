import { useEffect, useRef } from 'react'
import useDesktopStore from '../store'
import { WINDOW_CONSTRAINTS } from '../constants'

export default function useWindowDrag(windowId, titleBarRef, windowRef) {
  const updatePosition = useDesktopStore((s) => s.updatePosition)
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  })

  useEffect(() => {
    const titleBar = titleBarRef.current
    const windowEl = windowRef.current
    if (!titleBar || !windowEl) return

    const state = dragState.current

    const disableIframes = () => {
      document.querySelectorAll('iframe').forEach((f) => {
        f.style.pointerEvents = 'none'
      })
    }
    const enableIframes = () => {
      document.querySelectorAll('iframe').forEach((f) => {
        f.style.pointerEvents = ''
      })
    }

    const handleMouseDown = (e) => {
      // Don't drag when clicking traffic lights
      if (e.target.closest('.traffic-lights')) return

      state.isDragging = true
      state.startX = e.clientX
      state.startY = e.clientY
      state.initialX = windowEl.offsetLeft
      state.initialY = windowEl.offsetTop

      disableIframes()
      // Prevent text selection during drag
      e.preventDefault()
    }

    const handleMouseMove = (e) => {
      if (!state.isDragging) return

      const deltaX = e.clientX - state.startX
      const deltaY = e.clientY - state.startY

      let newX = state.initialX + deltaX
      let newY = state.initialY + deltaY

      // Keep window within viewport bounds
      const maxX = globalThis.innerWidth - 80 // Keep at least 80px visible
      const maxY = globalThis.innerHeight - 40

      newX = Math.max(-windowEl.offsetWidth + 80, Math.min(newX, maxX))
      newY = Math.max(WINDOW_CONSTRAINTS.menuBarHeight, Math.min(newY, maxY))

      requestAnimationFrame(() => {
        updatePosition(windowId, { x: newX, y: newY })
      })
    }

    const handleMouseUp = () => {
      if (state.isDragging) enableIframes()
      state.isDragging = false
    }

    titleBar.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      titleBar.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [windowId, titleBarRef, windowRef, updatePosition])
}
