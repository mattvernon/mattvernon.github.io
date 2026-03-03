import { useCallback } from 'react'
import useHomeStore from '../store'
import { ARTIFACTS, getCanvasDimensions, getArtifactLayout } from '../constants'

const IS_DEV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

export default function LayoutEditor() {
  if (!IS_DEV) return null

  const dragOffsets = useHomeStore((s) => s.dragOffsets)
  const widthOverrides = useHomeStore((s) => s.widthOverrides)
  const zOverrides = useHomeStore((s) => s.zOverrides)
  const canvasScrollRef = useHomeStore((s) => s.canvasScrollRef)

  const handleCopy = useCallback(() => {
    const { w: canvasW, h: canvasH } = getCanvasDimensions()

    const layout = ARTIFACTS.map((artifact, i) => {
      const base = getArtifactLayout(i)
      const offset = dragOffsets[artifact.filename] || { dx: 0, dy: 0 }
      const widthPx = widthOverrides[artifact.filename] || base.width
      const z = zOverrides[artifact.filename] ?? base.z ?? 1

      // Final position = base + drag offset, normalized to canvas %
      const finalX = base.x + offset.dx
      const finalY = base.y + offset.dy

      return {
        filename: artifact.filename,
        x: Math.round((finalX / canvasW) * 10000) / 10000,
        y: Math.round((finalY / canvasH) * 10000) / 10000,
        w: Math.round(widthPx),
        z,
      }
    })

    const json = JSON.stringify(layout, null, 2)
    navigator.clipboard.writeText(json).then(() => {
      alert('Layout copied to clipboard! Paste it into MANUAL_LAYOUT in constants.js')
    })

    console.log('--- LAYOUT DATA ---')
    console.log(json)
  }, [dragOffsets, widthOverrides, zOverrides])

  const handleReset = useCallback(() => {
    useHomeStore.setState({ dragOffsets: {}, widthOverrides: {}, zOverrides: {}, zOrder: [] })
  }, [])

  const handleRecenter = useCallback(() => {
    const el = canvasScrollRef?.current
    if (!el) return
    const { w, h } = getCanvasDimensions()
    el.scrollTo({
      left: (w - el.clientWidth) / 2,
      top: (h - el.clientHeight) / 2,
      behavior: 'smooth',
    })
  }, [canvasScrollRef])

  return (
    <div className="hm-layout-editor">
      <button className="hm-layout-editor-btn" onClick={handleRecenter}>
        ⊹ Re-center
      </button>
      <button className="hm-layout-editor-btn" onClick={handleCopy}>
        📋 Copy Layout
      </button>
      <button className="hm-layout-editor-btn hm-layout-editor-btn--reset" onClick={handleReset}>
        ↺ Reset
      </button>
    </div>
  )
}
