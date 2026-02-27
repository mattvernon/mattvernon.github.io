import * as THREE from 'three'
import {
  STREETS,
  BLOCKS,
  BROADWAY,
  SIDEWALK_WIDTH,
  MAP_BOUNDS,
  WATER_ZONES,
  getDistrictAt,
  distToSegment,
} from './MapData.js'
import { buildRoadNetwork } from './RoadNetworkBuilder.js'
import { createBuilding, createNeonSign, randomBuildingHeight } from './BuildingFactory.js'
import { getLampAssets, getConeAssets } from './PropsFactory.js'
import { createSky } from './Skybox.js'
import InstanceManager from './InstanceManager.js'
import BridgeBuilder from './BridgeBuilder.js'
import WaterRenderer from './WaterRenderer.js'
import CentralParkBuilder from './landmarks/CentralParkBuilder.js'
import TimesSquareBuilder from './landmarks/TimesSquareBuilder.js'
import { LAMP_HEIGHT, LAMP_SPACING, PALETTE } from '../constants.js'

export default class MapGenerator {
  constructor(scene, collisionSystem, elevationSystem) {
    this.scene = scene
    this.collision = collisionSystem
    this.elevation = elevationSystem
  }

  build() {
    // Sky and atmosphere
    createSky(this.scene)

    // Roads (dashes are already instanced inside RoadNetworkBuilder)
    // Bridge segments are skipped here — BridgeBuilder handles them
    const roads = buildRoadNetwork(STREETS)
    this.scene.add(roads)

    // Bridges with elevation
    if (this.elevation) {
      const bridgeBuilder = new BridgeBuilder(this.elevation)
      bridgeBuilder.build(this.scene, this.collision)
    }

    // Ground plane (split around water zones)
    this._createGround()

    // Water (East River)
    const water = new WaterRenderer()
    water.build(this.scene, this.collision)

    // Central Park
    const park = new CentralParkBuilder(this.elevation)
    park.build(this.scene, this.collision)

    // Times Square
    const timesSquare = new TimesSquareBuilder()
    timesSquare.build(this.scene)

    // Buildings
    const buildingsGroup = new THREE.Group()
    const neonGroup = new THREE.Group()

    for (const block of BLOCKS) {
      const district = getDistrictAt(block.centerX, block.centerZ)
      if (!district) continue

      if (Math.random() > district.buildingDensity) continue

      const subBlocks = this._splitBlock(block)

      for (const sub of subBlocks) {
        if (Math.random() > district.buildingDensity) continue

        const footprints = this._subdivide(sub.width, sub.depth)

        for (const fp of footprints) {
          const bx = sub.centerX + fp.offsetX
          const bz = sub.centerZ + fp.offsetZ
          const padding = SIDEWALK_WIDTH + 0.5

          const distToBroadway = distToSegment(
            bx, bz,
            BROADWAY.start.x, BROADWAY.start.z,
            BROADWAY.end.x, BROADWAY.end.z
          )
          if (distToBroadway < BROADWAY.width / 2 + Math.max(fp.width, fp.depth) / 2) continue

          const bw = fp.width - padding
          const bd = fp.depth - padding
          if (bw < 4 || bd < 4) continue

          const height = randomBuildingHeight(district)
          const building = createBuilding(bx, bz, bw, bd, height, district)
          buildingsGroup.add(building)

          const hw = bw / 2
          const hd = bd / 2
          this.collision.addStaticBody(bx - hw, bz - hd, bx + hw, bz + hd)

          const signChance = district.neonSignChance
          const maxSigns = district.neonSignsPerFace || 1
          if (Math.random() < signChance) {
            const faces = ['front', 'back', 'left', 'right']
            for (let s = 0; s < maxSigns; s++) {
              const face = faces[Math.floor(Math.random() * faces.length)]
              neonGroup.add(createNeonSign(building, face))
            }
          }
          if (Math.random() < signChance * 0.3) {
            const faces = ['front', 'back', 'left', 'right']
            const face = faces[Math.floor(Math.random() * faces.length)]
            neonGroup.add(createNeonSign(building, face))
          }
        }
      }
    }

    this.scene.add(buildingsGroup)
    this.scene.add(neonGroup)

    // --- Instanced street lamps ---
    const lamp = getLampAssets()
    const instances = new InstanceManager()
    instances.register('lampPole', lamp.poleGeo, lamp.poleMat)
    instances.register('lampHead', lamp.headGeo, lamp.headMat)
    instances.register('lampGlow', lamp.glowGeo, lamp.glowMat)

    const lampSpacing = LAMP_SPACING * 2

    for (const seg of STREETS) {
      const isBridge = seg.type === 'bridge'

      const dx = seg.end.x - seg.start.x
      const dz = seg.end.z - seg.start.z
      const length = Math.sqrt(dx * dx + dz * dz)
      if (length < lampSpacing) continue

      const dirX = dx / length
      const dirZ = dz / length
      const swOffset = seg.width / 2 + SIDEWALK_WIDTH / 2
      let sideToggle = 1

      for (let d = 0; d < length; d += lampSpacing) {
        const px = seg.start.x + dirX * d
        const pz = seg.start.z + dirZ * d
        const perpX = -dz / length
        const perpZ = dx / length
        const lx = px + perpX * swOffset * sideToggle
        const lz = pz + perpZ * swOffset * sideToggle

        // On bridges, elevate lamps to match the deck height
        const baseY = (isBridge && this.elevation)
          ? this.elevation.getElevation(px, pz)
          : 0

        instances.add('lampPole', lx, baseY + LAMP_HEIGHT / 2, lz)
        instances.add('lampHead', lx, baseY + LAMP_HEIGHT, lz)
        instances.add('lampGlow', lx, baseY + 0.02, lz)

        sideToggle *= -1
      }
    }

    // --- Instanced traffic cones ---
    const cone = getConeAssets()
    instances.register('cone', cone.coneGeo, cone.coneMat)
    instances.register('coneStripe', cone.stripeGeo, cone.stripeMat)

    for (let i = 0; i < 40; i++) {
      const seg = STREETS[Math.floor(Math.random() * STREETS.length)]
      if (seg.type === 'bridge') continue
      const t = Math.random()
      const x = seg.start.x + (seg.end.x - seg.start.x) * t
      const z = seg.start.z + (seg.end.z - seg.start.z) * t
      const offset = (Math.random() - 0.5) * seg.width * 0.6
      const sdx = seg.end.x - seg.start.x
      const sdz = seg.end.z - seg.start.z
      const len = Math.sqrt(sdx * sdx + sdz * sdz)
      if (len < 1) continue
      const cx = x + (-sdz / len) * offset
      const cz = z + (sdx / len) * offset

      instances.add('cone', cx, 0.3, cz)
      instances.add('coneStripe', cx, 0.35, cz)
    }

    // Build all instanced meshes
    instances.build(this.scene)
  }

  _createGround() {
    const pad = 100
    const minX = MAP_BOUNDS.minX - pad
    const maxX = MAP_BOUNDS.maxX + pad
    const minZ = MAP_BOUNDS.minZ - pad
    const maxZ = MAP_BOUNDS.maxZ + pad
    const groundMat = new THREE.MeshBasicMaterial({ color: PALETTE.ground })

    // Split ground into 4 pieces around water zone
    const wz = WATER_ZONES[0].bounds

    // Left piece (west of water)
    this._addGroundRect(minX, minZ, wz.minX, maxZ, groundMat)
    // Right piece (east of water)
    this._addGroundRect(wz.maxX, minZ, maxX, maxZ, groundMat)
    // Top strip (above water, between left and right pieces)
    this._addGroundRect(wz.minX, wz.maxZ, wz.maxX, maxZ, groundMat)
    // Bottom strip (below water, between left and right pieces)
    this._addGroundRect(wz.minX, minZ, wz.maxX, wz.minZ, groundMat)
  }

  _addGroundRect(x0, z0, x1, z1, mat) {
    const w = x1 - x0
    const d = z1 - z0
    if (w <= 0 || d <= 0) return
    const geo = new THREE.PlaneGeometry(w, d)
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2)
    this.scene.add(mesh)
  }

  _splitBlock(block) {
    const targetSize = 40
    const numX = Math.max(1, Math.round(block.width / targetSize))
    const numZ = Math.max(1, Math.round(block.depth / targetSize))
    const subW = block.width / numX
    const subD = block.depth / numZ
    const subBlocks = []

    for (let ix = 0; ix < numX; ix++) {
      for (let iz = 0; iz < numZ; iz++) {
        const ox = (ix - (numX - 1) / 2) * subW
        const oz = (iz - (numZ - 1) / 2) * subD
        subBlocks.push({
          centerX: block.centerX + ox,
          centerZ: block.centerZ + oz,
          width: subW,
          depth: subD,
        })
      }
    }
    return subBlocks
  }

  _subdivide(width, depth) {
    const count = 1 + Math.floor(Math.random() * 3)
    if (count === 1) {
      return [{ offsetX: 0, offsetZ: 0, width, depth }]
    }
    if (count === 2) {
      if (width > depth) {
        const split = 0.35 + Math.random() * 0.3
        const w1 = width * split
        const w2 = width * (1 - split)
        const gap = 1
        return [
          { offsetX: -(w2 + gap) / 2, offsetZ: 0, width: w1 - gap, depth },
          { offsetX: (w1 + gap) / 2, offsetZ: 0, width: w2 - gap, depth },
        ]
      } else {
        const split = 0.35 + Math.random() * 0.3
        const d1 = depth * split
        const d2 = depth * (1 - split)
        const gap = 1
        return [
          { offsetX: 0, offsetZ: -(d2 + gap) / 2, width, depth: d1 - gap },
          { offsetX: 0, offsetZ: (d1 + gap) / 2, width, depth: d2 - gap },
        ]
      }
    }
    const hw = width / 2
    const hd = depth / 2
    const gap = 0.5
    const results = [
      { offsetX: -hw / 2, offsetZ: -hd / 2, width: hw - gap, depth: hd - gap },
      { offsetX: hw / 2, offsetZ: -hd / 2, width: hw - gap, depth: hd - gap },
      { offsetX: -hw / 2, offsetZ: hd / 2, width: hw - gap, depth: hd - gap },
    ]
    if (Math.random() > 0.3) {
      results.push({ offsetX: hw / 2, offsetZ: hd / 2, width: hw - gap, depth: hd - gap })
    }
    return results
  }
}
