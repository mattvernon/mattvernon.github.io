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
// Canvas is ~1.8x viewport in each dimension for some scroll room
export function getCanvasDimensions() {
  if (typeof window === 'undefined') return { w: 2800, h: 2800 }
  const vw = window.innerWidth
  const vh = window.innerHeight
  return {
    w: Math.round(vw * 1.8),
    h: Math.round(vh * 2.2),
  }
}

// ── Manual layout ──
// Paste output from the "Copy Layout" dev tool here.
// Positions are stored as % of canvas, widths as % of viewport.
// When this array has entries, it overrides the algorithmic layout.
export const MANUAL_LAYOUT = [
  { filename: 'aura_discovery.mp4', x: 0.1704, y: -0.0071, w: 0.2292 },
  { filename: 'aura_predictflow.mp4', x: 0.2524, y: 0.5745, w: 0.215 },
  { filename: 'foundation_create.gif', x: 0.4106, y: 0.1974, w: 0.1997 },
  { filename: 'foundation_drops.mp4', x: 0.3268, y: 0.1187, w: 0.1866 },
  { filename: 'foundation_worlds.mp4', x: 0.6495, y: 0.4091, w: 0.2425 },
  { filename: 'friendzoned.mp4', x: 0.811, y: 0.2446, w: 0.2281 },
  { filename: 'new_drop.mp4', x: 0.2062, y: 0.3654, w: 0.2145 },
  { filename: 'rode_Secondary.mp4', x: 0.8267, y: 0.4774, w: 0.1997 },
  { filename: 'rodeo_1millionmints.mp4', x: 0.5555, y: 0.2194, w: 0.1866 },
  { filename: 'rodeo_darkmode.mp4', x: 0.5076, y: 0.4713, w: 0.2421 },
  { filename: 'rodeo_iosLaunch.mp4', x: 0.32, y: 0.2954, w: 0.2281 },
  { filename: 'rodeo_launchvideo.mp4', x: 0.6641, y: 0.554, w: 0.2139 },
  { filename: 'rodeo_merch.jpeg', x: 0.6867, y: 0.1393, w: 0.1996 },
  { filename: 'rodeo_runs_on_dollars.mp4', x: 0.3614, y: 0.5297, w: 0.1855 },
  { filename: 'rodeo_Tags.mp4', x: 0.0935, y: 0.5791, w: 0.2413 },
  { filename: 'rodeo_tools.mp4', x: 0.4982, y: 0.7461, w: 0.2281 },
  { filename: 'rodeoIRL.mp4', x: 0.768, y: 0.7724, w: 0.2128 },
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
