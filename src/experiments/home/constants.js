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

// Canvas dimensions scale to the viewport so content fills the screen
// Canvas is ~3.6x viewport width and ~4.4x height for an infinite feel
export function getCanvasDimensions() {
  if (typeof window === 'undefined') return { w: 5600, h: 5600 }
  const vw = window.innerWidth
  const vh = window.innerHeight
  return {
    w: Math.round(vw * 3.6),
    h: Math.round(vh * 4.4),
  }
}

// ── Manual layout ──
// Paste output from the "Copy Layout" dev tool here.
// Positions are stored as % of canvas, widths as % of viewport.
// When this array has entries, it overrides the algorithmic layout.
export const MANUAL_LAYOUT = [
  { filename: 'aura_discovery.mp4', x: 0.3352, y: 0.2465, w: 0.2292 },
  { filename: 'aura_predictflow.mp4', x: 0.3762, y: 0.5373, w: 0.215 },
  { filename: 'foundation_create.gif', x: 0.2246, y: 0.3994, w: 0.4118 },
  { filename: 'foundation_drops.mp4', x: 0.4104, y: 0.3018, w: 0.3863 },
  { filename: 'foundation_worlds.mp4', x: 0.5894, y: 0.4397, w: 0.3684 },
  { filename: 'friendzoned.mp4', x: 0.6671, y: 0.3738, w: 0.2281 },
  { filename: 'new_drop.mp4', x: 0.3531, y: 0.4327, w: 0.2145 },
  { filename: 'rode_Secondary.mp4', x: 0.673, y: 0.5003, w: 0.1997 },
  { filename: 'rodeo_1millionmints.mp4', x: 0.5278, y: 0.3597, w: 0.1866 },
  { filename: 'rodeo_darkmode.mp4', x: 0.5038, y: 0.4857, w: 0.2421 },
  { filename: 'rodeo_iosLaunch.mp4', x: 0.41, y: 0.3977, w: 0.2281 },
  { filename: 'rodeo_launchvideo.mp4', x: 0.5821, y: 0.527, w: 0.2139 },
  { filename: 'rodeo_merch.jpeg', x: 0.5934, y: 0.3197, w: 0.1996 },
  { filename: 'rodeo_runs_on_dollars.mp4', x: 0.4307, y: 0.5149, w: 0.1855 },
  { filename: 'rodeo_Tags.mp4', x: 0.2968, y: 0.5396, w: 0.2413 },
  { filename: 'rodeo_tools.mp4', x: 0.4991, y: 0.6231, w: 0.2281 },
  { filename: 'rodeoIRL.mp4', x: 0.634, y: 0.6362, w: 0.2128 },
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
      width: manual.w * vw,
    }
  }

  // Fallback: jittered grid
  const baseCardW = vw * 0.18
  const seed = ((index + 1) * 2654435761) >>> 0
  const cardWidth = baseCardW + seededRand(seed, 4) * vw * 0.07

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
