import { DISTRICTS } from './DistrictConfig.js'

// === Map Bounds ===
export const MAP_BOUNDS = {
  minX: -1150,
  maxX: 850,
  minZ: -1000,
  maxZ: 1000,
}

// === Road widths by type ===
export const ROAD_WIDTHS = {
  avenue: 14,
  street: 10,
  broadway: 16,
  bridge: 14,
}

export const SIDEWALK_WIDTH = 2

// === Central Park ===
export const CENTRAL_PARK = {
  minX: -520,
  maxX: -150,
  minZ: 200,
  maxZ: 700,
}

// === Water zones ===
export const WATER_ZONES = [
  { id: 'east-river', bounds: { minX: 300, maxX: 500, minZ: -900, maxZ: 500 } },
]

// === District zones (checked in order — first match wins) ===
export const DISTRICT_ZONES = [
  {
    id: 'timesSquare',
    bounds: { minX: -470, maxX: -330, minZ: 30, maxZ: 200 },
    config: DISTRICTS.timesSquare,
  },
  {
    id: 'centralPark',
    bounds: CENTRAL_PARK,
    config: null, // no buildings
  },
  {
    id: 'uptown',
    bounds: { minX: -1100, maxX: 300, minZ: 400, maxZ: 950 },
    config: DISTRICTS.uptown,
  },
  {
    id: 'midtown',
    bounds: { minX: -1100, maxX: 300, minZ: -200, maxZ: 400 },
    config: DISTRICTS.midtown,
  },
  {
    id: 'downtown',
    bounds: { minX: -1100, maxX: 300, minZ: -950, maxZ: -200 },
    config: DISTRICTS.downtown,
  },
  {
    id: 'brooklyn',
    bounds: { minX: 500, maxX: 830, minZ: -800, maxZ: 420 },
    config: DISTRICTS.brooklyn,
  },
]

// === Manhattan grid ===
// Avenue X positions (west to east)
const MH_AVENUES = [-1050, -920, -790, -660, -530, -400, -270, -140, -10, 120, 250]

// Regular cross-street Z positions (midtown/uptown, every 55 units)
const MH_REGULAR_Z = []
for (let z = -500; z <= 875; z += 55) MH_REGULAR_Z.push(z)

// Lower Manhattan cross streets (irregular spacing)
const MH_LOWER_Z = [-850, -760, -670, -580]

// All Manhattan cross-street Z positions (sorted)
const MH_ALL_Z = [...MH_LOWER_Z, ...MH_REGULAR_Z].sort((a, b) => a - b)

// === Brooklyn grid ===
const BK_AVENUES = [540, 660, 780]
const BK_STREETS_Z = []
for (let z = -750; z <= 370; z += 80) BK_STREETS_Z.push(z)

// === Broadway definition ===
export const BROADWAY = {
  start: { x: -150, z: 850 },
  end: { x: -650, z: -850 },
  width: ROAD_WIDTHS.broadway,
}

// === Bridge definitions (flat roads for Phase 1, elevated in Phase 3) ===
export const BRIDGE_DEFS = [
  {
    id: 'williamsburg',
    name: 'Williamsburg Bridge',
    start: { x: 250, z: 0 },
    end: { x: 540, z: 0 },
    width: 14,
    height: 10,
    style: 'truss',
  },
  {
    id: 'manhattan-bridge',
    name: 'Manhattan Bridge',
    start: { x: 250, z: -350 },
    end: { x: 540, z: -350 },
    width: 14,
    height: 10,
    style: 'suspension',
  },
  {
    id: 'brooklyn-bridge',
    name: 'Brooklyn Bridge',
    start: { x: 250, z: -600 },
    end: { x: 540, z: -600 },
    width: 14,
    height: 12,
    style: 'gothic',
  },
]

// ===================================================================
// Generate all road segments
// ===================================================================
function generateStreets() {
  const streets = []

  // --- Manhattan avenues (N-S) ---
  for (const x of MH_AVENUES) {
    if (x > CENTRAL_PARK.minX && x < CENTRAL_PARK.maxX) {
      // Split around Central Park
      streets.push({
        type: 'avenue',
        start: { x, z: -900 },
        end: { x, z: CENTRAL_PARK.minZ },
        width: ROAD_WIDTHS.avenue,
      })
      streets.push({
        type: 'avenue',
        start: { x, z: CENTRAL_PARK.maxZ },
        end: { x, z: 900 },
        width: ROAD_WIDTHS.avenue,
      })
    } else {
      streets.push({
        type: 'avenue',
        start: { x, z: -900 },
        end: { x, z: 900 },
        width: ROAD_WIDTHS.avenue,
      })
    }
  }

  // --- Manhattan cross streets (E-W) ---
  const mhXMin = MH_AVENUES[0]
  const mhXMax = MH_AVENUES[MH_AVENUES.length - 1]

  for (const z of MH_ALL_Z) {
    if (z > CENTRAL_PARK.minZ && z < CENTRAL_PARK.maxZ) {
      // Split around Central Park
      streets.push({
        type: 'street',
        start: { x: mhXMin, z },
        end: { x: CENTRAL_PARK.minX, z },
        width: ROAD_WIDTHS.street,
      })
      streets.push({
        type: 'street',
        start: { x: CENTRAL_PARK.maxX, z },
        end: { x: mhXMax, z },
        width: ROAD_WIDTHS.street,
      })
    } else {
      streets.push({
        type: 'street',
        start: { x: mhXMin, z },
        end: { x: mhXMax, z },
        width: ROAD_WIDTHS.street,
      })
    }
  }

  // --- Broadway (diagonal) ---
  streets.push({
    type: 'broadway',
    start: BROADWAY.start,
    end: BROADWAY.end,
    width: BROADWAY.width,
  })

  // --- Brooklyn avenues (N-S) ---
  for (const x of BK_AVENUES) {
    streets.push({
      type: 'avenue',
      start: { x, z: -750 },
      end: { x, z: 370 },
      width: ROAD_WIDTHS.avenue,
    })
  }

  // --- Brooklyn cross streets (E-W) ---
  for (const z of BK_STREETS_Z) {
    streets.push({
      type: 'street',
      start: { x: BK_AVENUES[0], z },
      end: { x: BK_AVENUES[BK_AVENUES.length - 1], z },
      width: ROAD_WIDTHS.avenue, // Brooklyn streets are wider
    })
  }

  // --- Bridge roads (flat for Phase 1) ---
  for (const bridge of BRIDGE_DEFS) {
    streets.push({
      type: 'bridge',
      start: bridge.start,
      end: bridge.end,
      width: bridge.width,
    })
  }

  return streets
}

export const STREETS = generateStreets()

// ===================================================================
// Generate buildable blocks from grid intersections
// ===================================================================
function pointInBounds(x, z, b) {
  return x > b.minX && x < b.maxX && z > b.minZ && z < b.maxZ
}

function generateBlocks() {
  const blocks = []
  const aveW = ROAD_WIDTHS.avenue
  const stW = ROAD_WIDTHS.street

  // --- Manhattan blocks ---
  for (let i = 0; i < MH_AVENUES.length - 1; i++) {
    const blockLeft = MH_AVENUES[i] + aveW / 2
    const blockRight = MH_AVENUES[i + 1] - aveW / 2
    const blockWidth = blockRight - blockLeft
    if (blockWidth < 10) continue

    for (let j = 0; j < MH_ALL_Z.length - 1; j++) {
      const blockBottom = MH_ALL_Z[j] + stW / 2
      const blockTop = MH_ALL_Z[j + 1] - stW / 2
      const blockDepth = blockTop - blockBottom
      if (blockDepth < 10) continue

      const cx = (blockLeft + blockRight) / 2
      const cz = (blockBottom + blockTop) / 2

      // Skip Central Park
      if (pointInBounds(cx, cz, CENTRAL_PARK)) continue

      // Skip water
      let inWater = false
      for (const wz of WATER_ZONES) {
        if (pointInBounds(cx, cz, wz.bounds)) { inWater = true; break }
      }
      if (inWater) continue

      blocks.push({ centerX: cx, centerZ: cz, width: blockWidth, depth: blockDepth })
    }
  }

  // --- Brooklyn blocks ---
  const bkBoundaryZ = [-800, ...BK_STREETS_Z, 420]
  for (let i = 0; i < BK_AVENUES.length - 1; i++) {
    const blockLeft = BK_AVENUES[i] + aveW / 2
    const blockRight = BK_AVENUES[i + 1] - aveW / 2
    const blockWidth = blockRight - blockLeft
    if (blockWidth < 10) continue

    for (let j = 0; j < bkBoundaryZ.length - 1; j++) {
      const blockBottom = bkBoundaryZ[j] + stW / 2
      const blockTop = bkBoundaryZ[j + 1] - stW / 2
      const blockDepth = blockTop - blockBottom
      if (blockDepth < 10) continue

      const cx = (blockLeft + blockRight) / 2
      const cz = (blockBottom + blockTop) / 2

      blocks.push({ centerX: cx, centerZ: cz, width: blockWidth, depth: blockDepth })
    }
  }

  return blocks
}

export const BLOCKS = generateBlocks()

// ===================================================================
// Helpers
// ===================================================================

// Determine district config for a point
export function getDistrictAt(x, z) {
  for (const dz of DISTRICT_ZONES) {
    if (pointInBounds(x, z, dz.bounds)) return dz.config
  }
  return DISTRICTS.midtown // fallback
}

// Distance from a point to a line segment (for Broadway exclusion)
export function distToSegment(px, pz, sx, sz, ex, ez) {
  const dx = ex - sx
  const dz = ez - sz
  const len2 = dx * dx + dz * dz
  if (len2 === 0) return Math.sqrt((px - sx) ** 2 + (pz - sz) ** 2)
  let t = ((px - sx) * dx + (pz - sz) * dz) / len2
  t = Math.max(0, Math.min(1, t))
  const nearX = sx + t * dx
  const nearZ = sz + t * dz
  return Math.sqrt((px - nearX) ** 2 + (pz - nearZ) ** 2)
}
