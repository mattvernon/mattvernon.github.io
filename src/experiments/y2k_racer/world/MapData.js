// Backward-compatibility shim — re-exports NYC map data for any remaining consumers
import nycConfig from './maps/NYCMapData.js'

export const MAP_BOUNDS = nycConfig.mapBounds
export const ROAD_WIDTHS = nycConfig.roadWidths
export const SIDEWALK_WIDTH = nycConfig.sidewalkWidth
export const CENTRAL_PARK = nycConfig.parkZones[0].bounds
export const WATER_ZONES = nycConfig.waterZones
export const DISTRICT_ZONES = nycConfig.districtZones
export const BROADWAY = nycConfig.broadway
export const BRIDGE_DEFS = nycConfig.bridgeDefs
export const STREETS = nycConfig.streets
export const BLOCKS = nycConfig.blocks

export function getDistrictAt(x, z) {
  return nycConfig.getDistrictAt(x, z)
}

// Distance from a point to a line segment
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
