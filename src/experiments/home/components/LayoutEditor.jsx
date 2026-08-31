import { useCallback } from 'react'
import useHomeStore from '../store'
import {
  ARTIFACTS,
  FEATURED_POSITIONING_FILES,
  getCanvasDimensions,
  getArtifactLayout,
} from '../constants'

const IS_DEV = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

export default function LayoutEditor() {
  const dragOffsets = useHomeStore((s) => s.dragOffsets)
  const widthOverrides = useHomeStore((s) => s.widthOverrides)
  const zOverrides = useHomeStore((s) => s.zOverrides)
  const canvasScrollRef = useHomeStore((s) => s.canvasScrollRef)

  const getCurrentLayout = useCallback((filenames = ARTIFACTS.map((artifact) => artifact.filename)) => {
    const { w: canvasW, h: canvasH } = getCanvasDimensions()

    return filenames.map((filename) => {
      const artifactIndex = ARTIFACTS.findIndex((artifact) => artifact.filename === filename)
      const artifact = ARTIFACTS[artifactIndex]
      if (!artifact) return null

      const base = getArtifactLayout(artifactIndex)
      const offset = dragOffsets[filename] || { dx: 0, dy: 0 }
      const widthPx = widthOverrides[filename] || base.width
      const z = zOverrides[filename] ?? base.z ?? 1

      return {
        filename,
        x: Math.round(((base.x + offset.dx) / canvasW) * 10000) / 10000,
        y: Math.round(((base.y + offset.dy) / canvasH) * 10000) / 10000,
        w: Math.round(widthPx),
        z,
      }
    }).filter(Boolean)
  }, [dragOffsets, widthOverrides, zOverrides])

  const copyLayout = useCallback((layout, successMessage) => {
    const json = JSON.stringify(layout, null, 2)
    navigator.clipboard.writeText(json).then(() => {
      alert(successMessage)
    })

    console.log('--- LAYOUT DATA ---')
    console.log(json)
  }, [])

  const handleCopy = useCallback(() => {
    copyLayout(
      getCurrentLayout(),
      'Layout copied to clipboard! Paste it into MANUAL_LAYOUT in constants.js'
    )
  }, [copyLayout, getCurrentLayout])

  const handleCopyFeatured = useCallback(() => {
    copyLayout(
      getCurrentLayout(FEATURED_POSITIONING_FILES),
      'New video coordinates copied to clipboard!'
    )
  }, [copyLayout, getCurrentLayout])

  const featuredLayout = getCurrentLayout(FEATURED_POSITIONING_FILES)

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

  if (!IS_DEV) return null

  return (
    <div className="hm-layout-editor">
      <div className="hm-layout-editor-actions">
        <button className="hm-layout-editor-btn" onClick={handleRecenter}>
          ⊹ Re-center
        </button>
        <button className="hm-layout-editor-btn" onClick={handleCopyFeatured}>
          📋 Copy New Videos
        </button>
        <button className="hm-layout-editor-btn" onClick={handleCopy}>
          Copy All
        </button>
        <button className="hm-layout-editor-btn hm-layout-editor-btn--reset" onClick={handleReset}>
          ↺ Reset
        </button>
      </div>
      <div className="hm-layout-editor-readout" aria-label="New video coordinates">
        {featuredLayout.map((item) => (
          <div className="hm-layout-editor-row" key={item.filename}>
            <span className="hm-layout-editor-file">{item.filename}</span>
            <span>x {item.x}</span>
            <span>y {item.y}</span>
            <span>w {item.w}</span>
            <span>z {item.z}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
