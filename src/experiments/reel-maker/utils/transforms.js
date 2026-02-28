/**
 * Calculate contain-fit dimensions for media within a canvas.
 */
export function containFit(mediaW, mediaH, canvasW, canvasH) {
  const aspect = mediaW / mediaH
  let baseW, baseH
  if (canvasW / canvasH > aspect) {
    baseH = canvasH
    baseW = baseH * aspect
  } else {
    baseW = canvasW
    baseH = baseW / aspect
  }
  return { baseW, baseH }
}

/**
 * Calculate the scale needed to cover (fill) the canvas.
 */
export function coverScale(mediaW, mediaH, canvasW, canvasH) {
  const { baseW, baseH } = containFit(mediaW, mediaH, canvasW, canvasH)
  return Math.round(Math.max(canvasW / baseW, canvasH / baseH) * 100)
}

/**
 * Calculate draw rectangle for a media item on the canvas.
 */
export function calcDrawRect(mediaW, mediaH, canvasW, canvasH, transform) {
  const { baseW, baseH } = containFit(mediaW, mediaH, canvasW, canvasH)
  const scale = transform.scale / 100
  const drawW = baseW * scale
  const drawH = baseH * scale
  const drawX = (canvasW - drawW) / 2 + transform.x
  const drawY = (canvasH - drawH) / 2 + transform.y
  return { drawX, drawY, drawW, drawH }
}

/**
 * Calculate alignment presets.
 */
export function alignmentPreset(preset, mediaW, mediaH, canvasW, canvasH, currentScale) {
  const { baseW, baseH } = containFit(mediaW, mediaH, canvasW, canvasH)
  const scale = currentScale / 100
  const scaledW = baseW * scale
  const scaledH = baseH * scale

  switch (preset) {
    case 'center':
      return { x: 0, y: 0 }
    case 'top':
      return { x: 0, y: -(canvasH - scaledH) / 2 }
    case 'bottom':
      return { x: 0, y: (canvasH - scaledH) / 2 }
    case 'left':
      return { x: -(canvasW - scaledW) / 2, y: 0 }
    case 'right':
      return { x: (canvasW - scaledW) / 2, y: 0 }
    case 'fill':
      return {
        scale: coverScale(mediaW, mediaH, canvasW, canvasH),
        x: 0,
        y: 0,
      }
    case 'fit':
      return { scale: 100, x: 0, y: 0 }
    default:
      return {}
  }
}
