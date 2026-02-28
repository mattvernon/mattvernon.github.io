import nyc from './NYCMapData.js'
import tokyo from './TokyoMapData.js'

const MAPS = { nyc, tokyo }

export function getMapConfig(id) {
  return MAPS[id] || MAPS.nyc
}

export const MAP_LIST = () => Object.values(MAPS)
