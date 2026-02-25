import { useEffect, useRef } from 'react'
import useDesktopStore from '../store'
import { WINDOW_CONSTRAINTS } from '../constants'

export default function useWindowResize(windowId, windowRef, resizable) {
  const updateSize = useDesktopStore((s) => s.updateSize)
  const updatePosition = useDesktopStore((s) => s.updatePosition)
  const resizeState = useRef({
    isResizing: false,
    direction: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startLeft: 0,
    startTop: 0,
  })

  useEffect(() => {
    if (!resizable) return

    const windowEl = windowRef.current
    if (!windowEl) return

    const state = resizeState.current

    const handleMouseDown = (e) => {
      const handle = e.target.closest('.resize-handle')
      if (!handle) return

      state.isResizing = true
      state.direction = handle.dataset.direction
      state.startX = e.clientX
      state.startY = e.clientY
      state.startWidth = windowEl.offsetWidth
      state.startHeight = windowEl.offsetHeight
      state.startLeft = windowEl.offsetLeft
      state.startTop = windowEl.offsetTop

      e.preventDefault()
      e.stopPropagation()
    }

    const handleMouseMove = (e) => {
      if (!state.isResizing) return

      const deltaX = e.clientX - state.startX
      const deltaY = e.clientY - state.startY
      const dir = state.direction

      let newWidth = state.startWidth
      let newHeight = state.startHeight
      let newX = state.startLeft
      let newY = state.startTop

      if (dir.includes('e')) {
        newWidth = Math.max(WINDOW_CONSTRAINTS.minWidth, state.startWidth + deltaX)
      }
      if (dir.includes('w')) {
        const proposedWidth = state.startWidth - deltaX
        newWidth = Math.max(WINDOW_CONSTRAINTS.minWidth, proposedWidth)
        newX = state.startLeft + (state.startWidth - newWidth)
      }
      if (dir.includes('s')) {
        newHeight = Math.max(WINDOW_CONSTRAINTS.minHeight, state.startHeight + deltaY)
      }
      if (dir.includes('n')) {
        const proposedHeight = state.startHeight - deltaY
        newHeight = Math.max(WINDOW_CONSTRAINTS.minHeight, proposedHeight)
        newY = state.startTop + (state.startHeight - newHeight)
      }

      requestAnimationFrame(() => {
        updateSize(windowId, { w: newWidth, h: newHeight })
        if (dir.includes('w') || dir.includes('n')) {
          updatePosition(windowId, { x: newX, y: newY })
        }
      })
    }

    const handleMouseUp = () => {
      state.isResizing = false
      state.direction = null
    }

    windowEl.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      windowEl.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [windowId, windowRef, resizable, updateSize, updatePosition])
}
