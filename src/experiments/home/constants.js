// Base canvas size — getCanvasSize() scales this to the viewport
export const CANVAS_SIZE = 2800
export const DEFAULT_BG_COLOR = '#3300FF'

// Add entries here as you upload files to /public/artifacts/
// type: 'image' | 'video'
export const ARTIFACTS = [
  { filename: 'aura_discovery.mp4', type: 'video' },
  { filename: 'aura_predictflow.mp4', type: 'video' },
  { filename: 'foundation_create.gif', type: 'image' },
  { filename: 'foundation_drops.mp4', type: 'video' },
  { filename: 'foundation_worlds.mp4', type: 'video' },
  { filename: 'friendzoned.mp4', type: 'video' },
  { filename: 'new_drop.mp4', type: 'video' },
  { filename: 'rode_Secondary.mp4', type: 'video' },
  { filename: 'rodeo_1millionmints.mp4', type: 'video' },
  { filename: 'rodeo_darkmode.mp4', type: 'video' },
  { filename: 'rodeo_iosLaunch.mp4', type: 'video' },
  { filename: 'rodeo_launchvideo.mp4', type: 'video' },
  { filename: 'rodeo_merch.jpeg', type: 'image' },
  { filename: 'rodeo_runs_on_dollars.mp4', type: 'video' },
  { filename: 'rodeo_Tags.mp4', type: 'video' },
  { filename: 'rodeo_tools.mp4', type: 'video' },
  { filename: 'rodeoIRL.mp4', type: 'video' },
]

// Seeded pseudo-random so layout is stable across reloads
function seededRand(seed, offset) {
  const v = ((seed + offset) * 2654435761) >>> 0
  return (v & 0xffff) / 0xffff
}

// Fixed canvas size — layout is viewport-independent.
// Smaller screens scroll more, larger screens see more empty space.
export function getCanvasDimensions() {
  return { w: 5600, h: 5600 }
}

// ── Manual layout ──
// Paste output from the "Copy Layout" dev tool here.
// Positions are stored as % of canvas, widths as absolute pixels.
// When this array has entries, it overrides the algorithmic layout.
// w values are absolute pixel widths (screen-size independent)
export const MANUAL_LAYOUT = [
  { filename: 'aura_discovery.mp4', x: 0.3038, y: 0.3922, w: 411, z: 1 },
  { filename: 'aura_predictflow.mp4', x: 0.5041, y: 0.2026, w: 432, z: 1 },
  { filename: 'foundation_create.gif', x: 0.2295, y: 0.5414, w: 819, z: 1 },
  { filename: 'foundation_drops.mp4', x: 0.3407, y: 0.3092, w: 664, z: 1 },
  { filename: 'foundation_worlds.mp4', x: 0.6086, y: 0.4158, w: 667, z: 100 },
  { filename: 'friendzoned.mp4', x: 0.7028, y: 0.3583, w: 413, z: 1 },
  { filename: 'new_drop.mp4', x: 0.4403, y: 0.2908, w: 254, z: 1 },
  { filename: 'rode_Secondary.mp4', x: 0.7093, y: 0.4732, w: 422, z: 1 },
  { filename: 'rodeo_1millionmints.mp4', x: 0.5171, y: 0.3555, w: 415, z: 1 },
  { filename: 'rodeo_darkmode.mp4', x: 0.5323, y: 0.4634, w: 365, z: 1 },
  { filename: 'rodeo_iosLaunch.mp4', x: 0.3983, y: 0.3923, w: 470, z: 1 },
  { filename: 'rodeo_launchvideo.mp4', x: 0.6098, y: 0.5025, w: 354, z: 1 },
  { filename: 'rodeo_merch.jpeg', x: 0.5956, y: 0.2966, w: 415, z: 1 },
  { filename: 'rodeo_runs_on_dollars.mp4', x: 0.2262, y: 0.3615, w: 389, z: 1 },
  { filename: 'rodeo_Tags.mp4', x: 0.3862, y: 0.5023, w: 513, z: 1 },
  { filename: 'rodeo_tools.mp4', x: 0.4968, y: 0.5511, w: 455, z: 1 },
  { filename: 'rodeoIRL.mp4', x: 0.6889, y: 0.5626, w: 556, z: 1 },
]

// Build a lookup map for quick access
const manualMap = {}
MANUAL_LAYOUT.forEach((item) => { manualMap[item.filename] = item })

// Returns layout for an artifact — uses manual position if available,
// otherwise falls back to jittered grid.
export function getArtifactLayout(index, total) {
  const count = total || ARTIFACTS.length
  const { w: canvasW, h: canvasH } = getCanvasDimensions()
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440

  const artifact = ARTIFACTS[index]
  const manual = manualMap[artifact.filename]

  if (manual) {
    return {
      x: manual.x * canvasW,
      y: manual.y * canvasH,
      rotation: 0,
      width: manual.w, // absolute pixels — no scaling
      z: manual.z || 1,
    }
  }

  // Fallback: jittered grid (still capped for consistency)
  const cardVw = Math.min(vw, 1440)
  const baseCardW = cardVw * 0.18
  const seed = ((index + 1) * 2654435761) >>> 0
  const cardWidth = baseCardW + seededRand(seed, 4) * cardVw * 0.07

  const cols = Math.ceil(Math.sqrt(count * 1.5))
  const rows = Math.ceil(count / cols)

  const col = index % cols
  const row = Math.floor(index / cols)

  const padX = cardWidth * 0.3
  const padY = cardWidth * 0.3
  const cellW = (canvasW - padX * 2) / cols
  const cellH = (canvasH - padY * 2) / rows

  const jitterX = (seededRand(seed, 1) - 0.5) * cellW * 0.4
  const jitterY = (seededRand(seed, 2) - 0.5) * cellH * 0.4

  const x = padX + col * cellW + cellW / 2 - cardWidth / 2 + jitterX
  const y = padY + row * cellH + cellH / 2 - (cardWidth * 0.85) / 2 + jitterY

  return { x, y, rotation: 0, width: cardWidth }
}
