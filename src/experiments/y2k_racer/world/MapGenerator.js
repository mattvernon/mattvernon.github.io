import * as THREE from 'three'
import { buildRoadNetwork } from './RoadNetworkBuilder.js'
import { createBuilding, createNeonSign, randomBuildingHeight } from './BuildingFactory.js'
import { getLampAssets, getConeAssets } from './PropsFactory.js'
import { createSky } from './Skybox.js'
import InstanceManager from './InstanceManager.js'
import BridgeBuilder from './BridgeBuilder.js'
import WaterRenderer from './WaterRenderer.js'
import { LAMP_HEIGHT, LAMP_SPACING, PALETTE, SIDEWALK_WIDTH } from '../constants.js'

// Distance from a point to a line segment (for broadway exclusion)
function distToSegment(px, pz, sx, sz, ex, ez) {
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

export default class MapGenerator {
  constructor(scene, collisionSystem, elevationSystem, mapConfig) {
    this.scene = scene
    this.collision = collisionSystem
    this.elevation = elevationSystem
    this.config = mapConfig
  }

  build() {
    const root = new THREE.Group()
    root.name = 'mapRoot'

    const config = this.config

    // Sky and atmosphere
    createSky(root)

    // Roads
    const roads = buildRoadNetwork(config.streets)
    root.add(roads)

    // Bridges with elevation (if any)
    if (config.bridgeDefs.length > 0 && this.elevation) {
      const bridgeBuilder = new BridgeBuilder(this.elevation, config.bridgeDefs)
      bridgeBuilder.build(root, this.collision)
    }

    // Ground plane
    this._createGround(root)

    // Water (if any)
    if (config.waterZones.length > 0) {
      const water = new WaterRenderer(config)
      water.build(root, this.collision)
    }

    // Landmarks
    for (const lm of config.landmarks) {
      const builder = lm.create(this.elevation)
      builder.build(root, this.collision)
    }

    // Buildings
    const buildingsGroup = new THREE.Group()
    const neonGroup = new THREE.Group()

    for (const block of config.blocks) {
      const district = config.getDistrictAt(block.centerX, block.centerZ)
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

          // Broadway exclusion (if present)
          if (config.broadway) {
            const distToBroadway = distToSegment(
              bx, bz,
              config.broadway.start.x, config.broadway.start.z,
              config.broadway.end.x, config.broadway.end.z
            )
            if (distToBroadway < config.broadway.width / 2 + Math.max(fp.width, fp.depth) / 2) continue
          }

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

    root.add(buildingsGroup)
    root.add(neonGroup)

    // --- Instanced street lamps ---
    const lamp = getLampAssets()
    const instances = new InstanceManager()
    instances.register('lampPole', lamp.poleGeo, lamp.poleMat)
    instances.register('lampHead', lamp.headGeo, lamp.headMat)
    instances.register('lampGlow', lamp.glowGeo, lamp.glowMat)

    const lampSpacing = LAMP_SPACING * 2

    for (const seg of config.streets) {
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
      const seg = config.streets[Math.floor(Math.random() * config.streets.length)]
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
    instances.build(root)

    this.scene.add(root)
    return root
  }

  _createGround(root) {
    const config = this.config
    const pad = 100
    const minX = config.mapBounds.minX - pad
    const maxX = config.mapBounds.maxX + pad
    const minZ = config.mapBounds.minZ - pad
    const maxZ = config.mapBounds.maxZ + pad
    const groundMat = new THREE.MeshBasicMaterial({ color: PALETTE.ground })

    if (config.waterZones.length > 0) {
      // Split ground into pieces around water zones
      const wz = config.waterZones[0].bounds

      // Left piece (west of water)
      this._addGroundRect(root, minX, minZ, wz.minX, maxZ, groundMat)
      // Right piece (east of water)
      this._addGroundRect(root, wz.maxX, minZ, maxX, maxZ, groundMat)
      // Top strip (above water)
      this._addGroundRect(root, wz.minX, wz.maxZ, wz.maxX, maxZ, groundMat)
      // Bottom strip (below water)
      this._addGroundRect(root, wz.minX, minZ, wz.maxX, wz.minZ, groundMat)
    } else {
      // Single ground plane
      this._addGroundRect(root, minX, minZ, maxX, maxZ, groundMat)
    }
  }

  _addGroundRect(parent, x0, z0, x1, z1, mat) {
    const w = x1 - x0
    const d = z1 - z0
    if (w <= 0 || d <= 0) return
    const geo = new THREE.PlaneGeometry(w, d)
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.x = -Math.PI / 2
    mesh.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2)
    parent.add(mesh)
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
