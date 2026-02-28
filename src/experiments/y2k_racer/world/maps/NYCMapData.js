import CentralParkBuilder from '../landmarks/CentralParkBuilder.js'
import TimesSquareBuilder from '../landmarks/TimesSquareBuilder.js'

// === Road widths by type ===
const ROAD_WIDTHS = {
  avenue: 14,
  street: 10,
  broadway: 16,
  bridge: 14,
}

const SIDEWALK_WIDTH = 2

// === Central Park ===
const CENTRAL_PARK = {
  minX: 150,
  maxX: 520,
  minZ: 200,
  maxZ: 700,
}

// === Water zones ===
const WATER_ZONES = [
  { id: 'east-river', bounds: { minX: -500, maxX: -300, minZ: -900, maxZ: 500 } },
]

// === District configs ===
const DISTRICTS = {
  midtown: {
    name: 'Midtown Manhattan',
    buildingHeight: { min: 40, max: 100 },
    buildingDensity: 0.95,
    neonSignChance: 0.6,
    windowLitChance: 0.4,
    groundColor: '#111122',
    buildingTint: '#0f0f1a',
    roofColor: '#1a1a2a',
  },
  downtown: {
    name: 'Lower Manhattan',
    buildingHeight: { min: 25, max: 75 },
    buildingDensity: 0.9,
    neonSignChance: 0.3,
    windowLitChance: 0.35,
    groundColor: '#0f0f1a',
    buildingTint: '#0f0f1a',
    roofColor: '#181828',
  },
  uptown: {
    name: 'Upper Manhattan',
    buildingHeight: { min: 15, max: 50 },
    buildingDensity: 0.75,
    neonSignChance: 0.25,
    windowLitChance: 0.25,
    groundColor: '#101020',
    buildingTint: '#121225',
    roofColor: '#1a1a2a',
  },
  timesSquare: {
    name: 'Times Square',
    buildingHeight: { min: 35, max: 80 },
    buildingDensity: 1.0,
    neonSignChance: 1.0,
    neonSignsPerFace: 2,
    windowLitChance: 0.6,
    groundColor: '#111122',
    buildingTint: '#0f0f1a',
    roofColor: '#1a1a2a',
  },
  brooklyn: {
    name: 'Brooklyn',
    buildingHeight: { min: 8, max: 28 },
    buildingDensity: 0.8,
    neonSignChance: 0.15,
    windowLitChance: 0.2,
    groundColor: '#0e0e1c',
    buildingTint: '#151528',
    roofColor: '#1c1c2e',
  },
}

// === District zones (checked in order — first match wins) ===
const DISTRICT_ZONES = [
  {
    id: 'timesSquare',
    bounds: { minX: 330, maxX: 470, minZ: 30, maxZ: 200 },
    config: DISTRICTS.timesSquare,
  },
  {
    id: 'centralPark',
    bounds: CENTRAL_PARK,
    config: null, // no buildings
  },
  {
    id: 'uptown',
    bounds: { minX: -300, maxX: 1100, minZ: 400, maxZ: 950 },
    config: DISTRICTS.uptown,
  },
  {
    id: 'midtown',
    bounds: { minX: -300, maxX: 1100, minZ: -200, maxZ: 400 },
    config: DISTRICTS.midtown,
  },
  {
    id: 'downtown',
    bounds: { minX: -300, maxX: 1100, minZ: -950, maxZ: -200 },
    config: DISTRICTS.downtown,
  },
  {
    id: 'brooklyn',
    bounds: { minX: -830, maxX: -500, minZ: -800, maxZ: 420 },
    config: DISTRICTS.brooklyn,
  },
]

// === Map Bounds ===
const MAP_BOUNDS = {
  minX: -850,
  maxX: 1150,
  minZ: -1000,
  maxZ: 1000,
}

// === Broadway definition ===
const BROADWAY = {
  start: { x: 650, z: 850 },
  end: { x: 150, z: -850 },
  width: ROAD_WIDTHS.broadway,
}

// === Bridge definitions ===
const BRIDGE_DEFS = [
  {
    id: 'williamsburg',
    name: 'Williamsburg Bridge',
    start: { x: -540, z: 0 },
    end: { x: -250, z: 0 },
    width: 14,
    height: 10,
    style: 'truss',
  },
  {
    id: 'manhattan-bridge',
    name: 'Manhattan Bridge',
    start: { x: -540, z: -350 },
    end: { x: -250, z: -350 },
    width: 14,
    height: 10,
    style: 'suspension',
  },
  {
    id: 'brooklyn-bridge',
    name: 'Brooklyn Bridge',
    start: { x: -540, z: -600 },
    end: { x: -250, z: -600 },
    width: 14,
    height: 12,
    style: 'gothic',
  },
]

// === Manhattan grid ===
const MH_AVENUES = [-250, -120, 10, 140, 270, 400, 530, 660, 790, 920, 1050]

const MH_REGULAR_Z = []
for (let z = -500; z <= 875; z += 55) MH_REGULAR_Z.push(z)

const MH_LOWER_Z = [-850, -760, -670, -580]
const MH_ALL_Z = [...MH_LOWER_Z, ...MH_REGULAR_Z].sort((a, b) => a - b)

// === Brooklyn grid ===
const BK_AVENUES = [-780, -660, -540]
const BK_STREETS_Z = []
for (let z = -750; z <= 370; z += 80) BK_STREETS_Z.push(z)

// ===================================================================
// Generate all road segments
// ===================================================================
function generateStreets() {
  const streets = []

  // Manhattan avenues (N-S)
  for (const x of MH_AVENUES) {
    if (x > CENTRAL_PARK.minX && x < CENTRAL_PARK.maxX) {
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

  // Manhattan cross streets (E-W)
  const mhXMin = MH_AVENUES[0]
  const mhXMax = MH_AVENUES[MH_AVENUES.length - 1]

  for (const z of MH_ALL_Z) {
    if (z > CENTRAL_PARK.minZ && z < CENTRAL_PARK.maxZ) {
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

  // Broadway (diagonal)
  streets.push({
    type: 'broadway',
    start: BROADWAY.start,
    end: BROADWAY.end,
    width: BROADWAY.width,
  })

  // Brooklyn avenues (N-S)
  for (const x of BK_AVENUES) {
    streets.push({
      type: 'avenue',
      start: { x, z: -750 },
      end: { x, z: 370 },
      width: ROAD_WIDTHS.avenue,
    })
  }

  // Brooklyn cross streets (E-W)
  for (const z of BK_STREETS_Z) {
    streets.push({
      type: 'street',
      start: { x: BK_AVENUES[0], z },
      end: { x: BK_AVENUES[BK_AVENUES.length - 1], z },
      width: ROAD_WIDTHS.avenue,
    })
  }

  // Bridge roads
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

  // Manhattan blocks
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

      if (pointInBounds(cx, cz, CENTRAL_PARK)) continue

      let inWater = false
      for (const wz of WATER_ZONES) {
        if (pointInBounds(cx, cz, wz.bounds)) { inWater = true; break }
      }
      if (inWater) continue

      blocks.push({ centerX: cx, centerZ: cz, width: blockWidth, depth: blockDepth })
    }
  }

  // Brooklyn blocks
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

// Determine district config for a point
function getDistrictAt(x, z) {
  for (const dz of DISTRICT_ZONES) {
    if (pointInBounds(x, z, dz.bounds)) return dz.config
  }
  return DISTRICTS.midtown // fallback
}

const STREETS = generateStreets()
const BLOCKS = generateBlocks()

// ===================================================================
// Export as map config
// ===================================================================
export default {
  id: 'nyc',
  name: 'New York City',
  subtitle: 'Manhattan & Brooklyn',
  musicTrack: 'mall grab - new york.mp3',

  spawnPoint: { x: 400, z: 105, heading: 0 },
  mapBounds: MAP_BOUNDS,
  roadWidths: ROAD_WIDTHS,
  sidewalkWidth: SIDEWALK_WIDTH,

  streets: STREETS,
  blocks: BLOCKS,
  districtZones: DISTRICT_ZONES,

  waterZones: WATER_ZONES,
  bridgeDefs: BRIDGE_DEFS,
  parkZones: [{ id: 'centralPark', bounds: CENTRAL_PARK }],
  broadway: BROADWAY,

  getDistrictAt,

  landmarks: [
    { create: (elev) => new CentralParkBuilder(elev, CENTRAL_PARK) },
    { create: () => new TimesSquareBuilder() },
  ],
}
