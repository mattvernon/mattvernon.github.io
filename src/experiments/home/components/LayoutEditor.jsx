import { useCallback } from 'react'
import useHomeStore from '../store'
import { ARTIFACTS, getCanvasDimensions, getArtifactLayout } from '../constants'

const IS_DEV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

export default function LayoutEditor() {
  if (!IS_DEV) return null

  const dragOffsets = useHomeStore((s) => s.dragOffsets)
  const widthOverrides = useHomeStore((s) => s.widthOverrides)

  const handleCopy = useCallback(() => {
    const { w: canvasW, h: canvasH } = getCanvasDimensions()
    const vw = window.innerWidth

    const layout = ARTIFACTS.map((artifact, i) => {
      const base = getArtifactLayout(i)
      const offset = dragOffsets[artifact.filename] || { dx: 0, dy: 0 }
      const widthPx = widthOverrides[artifact.filename] || base.width

      // Final position = base + drag offset, normalized to canvas %
      const finalX = base.x + offset.dx
      const finalY = base.y + offset.dy

      return {
        filename: artifact.filename,
        // Store as % of canvas so it scales to any viewport
        x: Math.round((finalX / canvasW) * 10000) / 10000,
        y: Math.round((finalY / canvasH) * 10000) / 10000,
        // Width as % of viewport width
        w: Math.round((widthPx / vw) * 10000) / 10000,
      }
    })

    const json = JSON.stringify(layout, null, 2)
    navigator.clipboard.writeText(json).then(() => {
      alert('Layout copied to clipboard! Paste it into MANUAL_LAYOUT in constants.js')
    })

    console.log('--- LAYOUT DATA ---')
    console.log(json)
  }, [dragOffsets, widthOverrides])

  const handleReset = useCallback(() => {
    // Clear all drag offsets and width overrides to reset
    useHomeStore.setState({ dragOffsets: {}, widthOverrides: {}, zOrder: [] })
  }, [])

  return (
    <div className="hm-layout-editor">
      <button className="hm-layout-editor-btn" onClick={handleCopy}>
        📋 Copy Layout
      </button>
      <button className="hm-layout-editor-btn hm-layout-editor-btn--reset" onClick={handleReset}>
        ↺ Reset
      </button>
    </div>
  )
}
