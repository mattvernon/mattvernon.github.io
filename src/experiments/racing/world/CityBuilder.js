import * as THREE from 'three'
import {
  GRID_SIZE,
  BLOCK_SIZE,
  ROAD_WIDTH,
  SIDEWALK_WIDTH,
  LAMP_SPACING,
  NEON_SIGN_CHANCE,
} from '../constants.js'
import { createBuilding, createNeonSign, randomBuildingHeight } from './BuildingFactory.js'
import { createRoads } from './RoadSystem.js'
import { createStreetLamp, createTrafficCone } from './PropsFactory.js'
import { createSky } from './Skybox.js'

export default class CityBuilder {
  constructor(scene, collisionSystem) {
    this.scene = scene
    this.collisionSystem = collisionSystem
  }

  build() {
    const cellSize = BLOCK_SIZE + ROAD_WIDTH
    const halfGrid = (GRID_SIZE * cellSize) / 2

    // Sky and atmosphere
    createSky(this.scene)

    // Roads
    const roads = createRoads(this.scene)
    this.scene.add(roads)

    // Buildings
    const buildingsGroup = new THREE.Group()
    const neonGroup = new THREE.Group()

    for (let gx = 0; gx < GRID_SIZE; gx++) {
      for (let gz = 0; gz < GRID_SIZE; gz++) {
        const blockCenterX = gx * cellSize - halfGrid + cellSize / 2
        const blockCenterZ = gz * cellSize - halfGrid + cellSize / 2

        // Subdivide block into 1-4 buildings
        const subdivisions = this._subdivideBlock(BLOCK_SIZE, BLOCK_SIZE)

        for (const sub of subdivisions) {
          const bx = blockCenterX + sub.offsetX
          const bz = blockCenterZ + sub.offsetZ
          const height = randomBuildingHeight()
          const padding = SIDEWALK_WIDTH + 0.5

          const building = createBuilding(bx, bz, sub.width - padding, sub.depth - padding, height)
          buildingsGroup.add(building)

          // Register collision
          const hw = (sub.width - padding) / 2
          const hd = (sub.depth - padding) / 2
          this.collisionSystem.addStaticBody(bx - hw, bz - hd, bx + hw, bz + hd)

          // Neon signs on street-facing sides
          if (Math.random() < NEON_SIGN_CHANCE) {
            const faces = ['front', 'back', 'left', 'right']
            const face = faces[Math.floor(Math.random() * faces.length)]
            const sign = createNeonSign(building, face)
            neonGroup.add(sign)
          }
          // Sometimes add a second sign
          if (Math.random() < NEON_SIGN_CHANCE * 0.5) {
            const faces = ['front', 'back', 'left', 'right']
            const face = faces[Math.floor(Math.random() * faces.length)]
            const sign = createNeonSign(building, face)
            neonGroup.add(sign)
          }
        }
      }
    }

    this.scene.add(buildingsGroup)
    this.scene.add(neonGroup)

    // Street lamps along roads (alternating sides, wider spacing for performance)
    const lampsGroup = new THREE.Group()
    const lampSpacing = LAMP_SPACING * 2 // wider spacing to reduce mesh count
    for (let i = 0; i <= GRID_SIZE; i++) {
      const roadPos = i * cellSize - halfGrid
      let sideToggle = 1

      // Lamps along horizontal roads (alternating sides)
      for (let d = -halfGrid; d < halfGrid; d += lampSpacing) {
        const lampZ = roadPos + sideToggle * (ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2)
        lampsGroup.add(createStreetLamp(d, lampZ))
        sideToggle *= -1
      }

      // Lamps along vertical roads (alternating sides)
      sideToggle = 1
      for (let d = -halfGrid; d < halfGrid; d += lampSpacing) {
        const lampX = roadPos + sideToggle * (ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2)
        lampsGroup.add(createStreetLamp(lampX, d))
        sideToggle *= -1
      }
    }
    this.scene.add(lampsGroup)

    // Scatter some traffic cones at random intersections
    for (let i = 0; i < 15; i++) {
      const rx = (Math.floor(Math.random() * GRID_SIZE) + 0.5) * cellSize - halfGrid
      const rz = (Math.floor(Math.random() * GRID_SIZE) + 0.5) * cellSize - halfGrid
      // Place near road edges
      const offsetX = (Math.random() - 0.5) * ROAD_WIDTH * 0.6
      const offsetZ = (Math.random() - 0.5) * ROAD_WIDTH * 0.6
      lampsGroup.add(createTrafficCone(rx + offsetX, rz + offsetZ))
    }
  }

  _subdivideBlock(width, depth) {
    const count = 1 + Math.floor(Math.random() * 3) // 1 to 3 buildings
    if (count === 1) {
      return [{ offsetX: 0, offsetZ: 0, width, depth }]
    }
    if (count === 2) {
      if (Math.random() > 0.5) {
        // Split horizontally
        const split = 0.35 + Math.random() * 0.3
        return [
          { offsetX: -width * (1 - split) / 2, offsetZ: 0, width: width * split, depth },
          { offsetX: width * split / 2, offsetZ: 0, width: width * (1 - split), depth },
        ]
      } else {
        // Split vertically
        const split = 0.35 + Math.random() * 0.3
        return [
          { offsetX: 0, offsetZ: -depth * (1 - split) / 2, width, depth: depth * split },
          { offsetX: 0, offsetZ: depth * split / 2, width, depth: depth * (1 - split) },
        ]
      }
    }
    // 3+ buildings: quad split
    const hw = width / 2
    const hd = depth / 2
    const results = [
      { offsetX: -hw / 2, offsetZ: -hd / 2, width: hw, depth: hd },
      { offsetX: hw / 2, offsetZ: -hd / 2, width: hw, depth: hd },
      { offsetX: -hw / 2, offsetZ: hd / 2, width: hw, depth: hd },
    ]
    if (Math.random() > 0.3) {
      results.push({ offsetX: hw / 2, offsetZ: hd / 2, width: hw, depth: hd })
    }
    return results
  }
}
