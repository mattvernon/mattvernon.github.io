import YoyogiParkBuilder from '../landmarks/YoyogiParkBuilder.js'
import ShibuyaCrossingBuilder from '../landmarks/ShibuyaCrossingBuilder.js'

// === Map Bounds ===
const MAP_BOUNDS = {
  minX: -800,
  maxX: 800,
  minZ: -800,
  maxZ: 800,
}

// === Road widths ===
const ROAD_WIDTHS = {
  avenue: 14,
  street: 8,
}

const SIDEWALK_WIDTH = 2

// === Yoyogi Park ===
const YOYOGI_PARK = {
  minX: -700,
  maxX: -200,
  minZ: -50,
  maxZ: 500,
}

// === Shibuya Crossing zone ===
const SHIBUYA_CROSSING = {
  minX: -100,
  maxX: 100,
  minZ: -350,
  maxZ: -150,
}

// === District configs ===
const DISTRICTS = {
  shinjuku: {
    name: 'Shinjuku',
    buildingHeight: { min: 50, max: 120 },
    buildingDensity: 0.95,
    neonSignChance: 0.5,
    windowLitChance: 0.5,
    groundColor: '#111122',
    buildingTint: '#0f0f1a',
    roofColor: '#1a1a2a',
  },
  kabukicho: {
    name: 'Kabukicho',
    buildingHeight: { min: 20, max: 55 },
    buildingDensity: 1.0,
    neonSignChance: 1.0,
    neonSignsPerFace: 3,
    windowLitChance: 0.65,
    groundColor: '#110818',
    buildingTint: '#120a1a',
    roofColor: '#1a1228',
  },
  harajuku: {
    name: 'Harajuku',
    buildingHeight: { min: 12, max: 40 },
    buildingDensity: 0.85,
    neonSignChance: 0.45,
    windowLitChance: 0.35,
    groundColor: '#101020',
    buildingTint: '#121225',
    roofColor: '#1a1a2a',
  },
  shibuya: {
    name: 'Shibuya',
    buildingHeight: { min: 25, max: 70 },
    buildingDensity: 0.95,
    neonSignChance: 0.7,
    neonSignsPerFace: 2,
    windowLitChance: 0.5,
    groundColor: '#0f0f1a',
    buildingTint: '#0f0f1a',
    roofColor: '#181828',
  },
  shibuyaCrossing: {
    name: 'Shibuya Crossing',
    buildingHeight: { min: 30, max: 75 },
    buildingDensity: 1.0,
    neonSignChance: 1.0,
    neonSignsPerFace: 3,
    windowLitChance: 0.6,
    groundColor: '#111122',
    buildingTint: '#0f0f1a',
    roofColor: '#1a1a2a',
  },
}

// === District zones (checked in order, first match wins) ===
const DISTRICT_ZONES = [
  {
    id: 'shibuyaCrossing',
    bounds: SHIBUYA_CROSSING,
    config: DISTRICTS.shibuyaCrossing,
  },
  {
    id: 'yoyogiPark',
    bounds: YOYOGI_PARK,
    config: null, // no buildings
  },
  {
    id: 'kabukicho',
    bounds: { minX: -200, maxX: 300, minZ: 500, maxZ: 800 },
    config: DISTRICTS.kabukicho,
  },
  {
    id: 'shinjuku',
    bounds: { minX: -800, maxX: 800, minZ: 300, maxZ: 800 },
    config: DISTRICTS.shinjuku,
  },
  {
    id: 'harajuku',
    bounds: { minX: -800, maxX: 800, minZ: -100, maxZ: 300 },
    config: DISTRICTS.harajuku,
  },
  {
    id: 'shibuya',
    bounds: { minX: -800, maxX: 800, minZ: -800, maxZ: -100 },
    config: DISTRICTS.shibuya,
  },
]

// === Grid definition ===
// N-S avenues (wider main roads)
const TK_NS_AVENUES = [-700, -500, -300, -100, 100, 300, 500, 700]

// E-W avenues (wider main roads)
const TK_EW_AVENUES_Z = [-700, -500, -300, -100, 100, 300, 500, 700]

// N-S side streets (between avenues)
const TK_NS_STREETS = [-600, -400, -200, 0, 200, 400, 600]

// E-W side streets (denser grid, every 50 units)
const TK_EW_STREETS_Z = []
for (let z = -750; z <= 750; z += 50) {
  // Skip if it overlaps an avenue position (within 10 units)
  const nearAvenue = TK_EW_AVENUES_Z.some(az => Math.abs(z - az) < 10)
  if (!nearAvenue) TK_EW_STREETS_Z.push(z)
}

// ===================================================================
// Helpers
// ===================================================================
function pointInBounds(x, z, b) {
  return x > b.minX && x < b.maxX && z > b.minZ && z < b.maxZ
}

function getDistrictAt(x, z) {
  for (const dz of DISTRICT_ZONES) {
    if (pointInBounds(x, z, dz.bounds)) return dz.config
  }
  return DISTRICTS.shibuya // fallback
}

// ===================================================================
// Generate streets
// ===================================================================
function generateStreets() {
  const streets = []

  // N-S avenues
  for (const x of TK_NS_AVENUES) {
    if (x > YOYOGI_PARK.minX && x < YOYOGI_PARK.maxX) {
      streets.push({
        type: 'avenue',
        start: { x, z: -780 },
        end: { x, z: YOYOGI_PARK.minZ },
        width: ROAD_WIDTHS.avenue,
      })
      streets.push({
        type: 'avenue',
        start: { x, z: YOYOGI_PARK.maxZ },
        end: { x, z: 780 },
        width: ROAD_WIDTHS.avenue,
      })
    } else {
      streets.push({
        type: 'avenue',
        start: { x, z: -780 },
        end: { x, z: 780 },
        width: ROAD_WIDTHS.avenue,
      })
    }
  }

  // E-W avenues
  for (const z of TK_EW_AVENUES_Z) {
    if (z > YOYOGI_PARK.minZ && z < YOYOGI_PARK.maxZ) {
      streets.push({
        type: 'avenue',
        start: { x: -780, z },
        end: { x: YOYOGI_PARK.minX, z },
        width: ROAD_WIDTHS.avenue,
      })
      streets.push({
        type: 'avenue',
        start: { x: YOYOGI_PARK.maxX, z },
        end: { x: 780, z },
        width: ROAD_WIDTHS.avenue,
      })
    } else {
      streets.push({
        type: 'avenue',
        start: { x: -780, z },
        end: { x: 780, z },
        width: ROAD_WIDTHS.avenue,
      })
    }
  }

  // N-S side streets
  for (const x of TK_NS_STREETS) {
    if (x > YOYOGI_PARK.minX && x < YOYOGI_PARK.maxX) {
      streets.push({
        type: 'street',
        start: { x, z: -780 },
        end: { x, z: YOYOGI_PARK.minZ },
        width: ROAD_WIDTHS.street,
      })
      streets.push({
        type: 'street',
        start: { x, z: YOYOGI_PARK.maxZ },
        end: { x, z: 780 },
        width: ROAD_WIDTHS.street,
      })
    } else {
      streets.push({
        type: 'street',
        start: { x, z: -780 },
        end: { x, z: 780 },
        width: ROAD_WIDTHS.street,
      })
    }
  }

  // E-W side streets
  for (const z of TK_EW_STREETS_Z) {
    if (z > YOYOGI_PARK.minZ && z < YOYOGI_PARK.maxZ) {
      streets.push({
        type: 'street',
        start: { x: -780, z },
        end: { x: YOYOGI_PARK.minX, z },
        width: ROAD_WIDTHS.street,
      })
      streets.push({
        type: 'street',
        start: { x: YOYOGI_PARK.maxX, z },
        end: { x: 780, z },
        width: ROAD_WIDTHS.street,
      })
    } else {
      streets.push({
        type: 'street',
        start: { x: -780, z },
        end: { x: 780, z },
        width: ROAD_WIDTHS.street,
      })
    }
  }

  return streets
}

// ===================================================================
// Generate buildable blocks
// ===================================================================
function generateBlocks() {
  const blocks = []
  const aveW = ROAD_WIDTHS.avenue

  // Combine all N-S road positions (avenues + side streets), sorted
  const allNS = [...TK_NS_AVENUES, ...TK_NS_STREETS].sort((a, b) => a - b)

  // Combine all E-W road positions, sorted
  const allEW = [...TK_EW_AVENUES_Z, ...TK_EW_STREETS_Z].sort((a, b) => a - b)

  for (let i = 0; i < allNS.length - 1; i++) {
    const leftRoadW = TK_NS_AVENUES.includes(allNS[i]) ? ROAD_WIDTHS.avenue : ROAD_WIDTHS.street
    const rightRoadW = TK_NS_AVENUES.includes(allNS[i + 1]) ? ROAD_WIDTHS.avenue : ROAD_WIDTHS.street
    const blockLeft = allNS[i] + leftRoadW / 2
    const blockRight = allNS[i + 1] - rightRoadW / 2
    const blockWidth = blockRight - blockLeft
    if (blockWidth < 8) continue

    for (let j = 0; j < allEW.length - 1; j++) {
      const bottomRoadW = TK_EW_AVENUES_Z.includes(allEW[j]) ? ROAD_WIDTHS.avenue : ROAD_WIDTHS.street
      const topRoadW = TK_EW_AVENUES_Z.includes(allEW[j + 1]) ? ROAD_WIDTHS.avenue : ROAD_WIDTHS.street
      const blockBottom = allEW[j] + bottomRoadW / 2
      const blockTop = allEW[j + 1] - topRoadW / 2
      const blockDepth = blockTop - blockBottom
      if (blockDepth < 8) continue

      const cx = (blockLeft + blockRight) / 2
      const cz = (blockBottom + blockTop) / 2

      // Skip Yoyogi Park
      if (pointInBounds(cx, cz, YOYOGI_PARK)) continue

      blocks.push({ centerX: cx, centerZ: cz, width: blockWidth, depth: blockDepth })
    }
  }

  return blocks
}

const STREETS = generateStreets()
const BLOCKS = generateBlocks()

// ===================================================================
// Export as map config
// ===================================================================
export default {
  id: 'tokyo',
  name: 'Tokyo',
  subtitle: 'Shibuya \u2022 Harajuku \u2022 Shinjuku',

  spawnPoint: { x: 0, z: -250, heading: 0 },
  mapBounds: MAP_BOUNDS,
  roadWidths: ROAD_WIDTHS,
  sidewalkWidth: SIDEWALK_WIDTH,

  streets: STREETS,
  blocks: BLOCKS,
  districtZones: DISTRICT_ZONES,

  waterZones: [],
  bridgeDefs: [],
  parkZones: [{ id: 'yoyogiPark', bounds: YOYOGI_PARK }],
  broadway: null,

  getDistrictAt,

  landmarks: [
    { create: (elev) => new YoyogiParkBuilder(elev, YOYOGI_PARK) },
    { create: () => new ShibuyaCrossingBuilder(SHIBUYA_CROSSING) },
  ],
}
