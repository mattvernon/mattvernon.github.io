import * as THREE from 'three'
import { PALETTE } from '../constants.js'

const WATER_COLOR = '#0a1525'
const WATER_Y = -0.5
const BANK_HEIGHT = 1.5
const BANK_THICKNESS = 0.4

export default class WaterRenderer {
  constructor(mapConfig) {
    this.waterZones = mapConfig.waterZones || []
    this.bridgeDefs = mapConfig.bridgeDefs || []
  }

  build(scene, collision) {
    const group = new THREE.Group()

    for (const zone of this.waterZones) {
      const b = zone.bounds
      const w = b.maxX - b.minX
      const d = b.maxZ - b.minZ
      const cx = (b.minX + b.maxX) / 2
      const cz = (b.minZ + b.maxZ) / 2

      // Water surface
      const waterGeo = new THREE.PlaneGeometry(w, d)
      const waterMat = new THREE.MeshBasicMaterial({
        color: WATER_COLOR,
        transparent: true,
        opacity: 0.9,
      })
      const water = new THREE.Mesh(waterGeo, waterMat)
      water.rotation.x = -Math.PI / 2
      water.position.set(cx, WATER_Y, cz)
      group.add(water)

      // Subtle glow highlights (for bloom reflections)
      const glowMat = new THREE.MeshBasicMaterial({
        color: '#1a3555',
        transparent: true,
        opacity: 0.15,
      })
      for (let i = 0; i < 60; i++) {
        const size = 1 + Math.random() * 4
        const glowGeo = new THREE.PlaneGeometry(size, size * (0.3 + Math.random() * 0.7))
        const glow = new THREE.Mesh(glowGeo, glowMat)
        glow.rotation.x = -Math.PI / 2
        glow.position.set(
          b.minX + Math.random() * w,
          WATER_Y + 0.02,
          b.minZ + Math.random() * d
        )
        group.add(glow)
      }

      // Bank walls (visual)
      this._createBankWalls(group, b)

      // Bank collision walls (with bridge gaps)
      this._createBankCollision(collision, b)
    }

    scene.add(group)
  }

  _createBankWalls(group, bounds) {
    const mat = new THREE.MeshBasicMaterial({ color: '#1a1a2a' })
    const { minX, maxX, minZ, maxZ } = bounds

    const westGeo = new THREE.BoxGeometry(BANK_THICKNESS, BANK_HEIGHT, maxZ - minZ)
    const west = new THREE.Mesh(westGeo, mat)
    west.position.set(minX, BANK_HEIGHT / 2 - 0.5, (minZ + maxZ) / 2)
    group.add(west)

    const east = new THREE.Mesh(westGeo, mat)
    east.position.set(maxX, BANK_HEIGHT / 2 - 0.5, (minZ + maxZ) / 2)
    group.add(east)

    const southGeo = new THREE.BoxGeometry(maxX - minX, BANK_HEIGHT, BANK_THICKNESS)
    const south = new THREE.Mesh(southGeo, mat)
    south.position.set((minX + maxX) / 2, BANK_HEIGHT / 2 - 0.5, minZ)
    group.add(south)

    const north = new THREE.Mesh(southGeo, mat)
    north.position.set((minX + maxX) / 2, BANK_HEIGHT / 2 - 0.5, maxZ)
    group.add(north)
  }

  _createBankCollision(collision, bounds) {
    const { minX, maxX, minZ, maxZ } = bounds
    const t = BANK_THICKNESS
    const bankY = BANK_HEIGHT

    const bridgeGaps = this.bridgeDefs
      .filter(b => b.start.x <= maxX && b.end.x >= minX)
      .map(b => ({ z: b.start.z, halfW: b.width / 2 + 3 }))

    this._addWallWithGaps(collision, minX - t, minX + t, minZ, maxZ, bridgeGaps, bankY)
    this._addWallWithGaps(collision, maxX - t, maxX + t, minZ, maxZ, bridgeGaps, bankY)

    collision.addStaticBody(minX, minZ - t, maxX, minZ + t, -1, bankY)
    collision.addStaticBody(minX, maxZ - t, maxX, maxZ + t, -1, bankY)
  }

  _addWallWithGaps(collision, wallMinX, wallMaxX, minZ, maxZ, gaps, bankY) {
    const sorted = [...gaps].sort((a, b) => (a.z - a.halfW) - (b.z - b.halfW))

    let currentZ = minZ
    for (const gap of sorted) {
      const gapStart = gap.z - gap.halfW
      const gapEnd = gap.z + gap.halfW

      if (currentZ < gapStart) {
        collision.addStaticBody(wallMinX, currentZ, wallMaxX, gapStart, -1, bankY)
      }
      currentZ = gapEnd
    }

    if (currentZ < maxZ) {
      collision.addStaticBody(wallMinX, currentZ, wallMaxX, maxZ, -1, bankY)
    }
  }
}
