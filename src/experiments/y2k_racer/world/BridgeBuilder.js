import * as THREE from 'three'
import { PALETTE, SIDEWALK_WIDTH } from '../constants.js'
import InstanceManager from './InstanceManager.js'

const BRIDGE_STYLES = {
  gothic: {
    deck: '#555544',
    barrier: '#7B7060',
    tower: '#8B8070',
    cable: '#666655',
  },
  suspension: {
    deck: PALETTE.road,
    barrier: '#4466AA',
    tower: '#5577AA',
    cable: '#334488',
  },
  truss: {
    deck: PALETTE.road,
    barrier: '#7A3328',
    tower: '#8B3A2E',
    cable: '#6A2A20',
  },
}

const DECK_SEGMENTS = 40
const BARRIER_HEIGHT = 1.2

export default class BridgeBuilder {
  constructor(elevationSystem, bridgeDefs) {
    this.elevation = elevationSystem
    this.bridgeDefs = bridgeDefs
  }

  build(scene, collision) {
    const instances = new InstanceManager()

    // Register shared geometries for instanced elements
    const cableGeo = new THREE.CylinderGeometry(0.06, 0.06, 1, 4)
    const postGeo = new THREE.BoxGeometry(0.3, 1, 0.3)

    for (const def of this.bridgeDefs) {
      const colors = BRIDGE_STYLES[def.style]
      const group = new THREE.Group()
      group.name = def.id

      const dx = def.end.x - def.start.x
      const dz = def.end.z - def.start.z
      const length = Math.sqrt(dx * dx + dz * dz)
      const dirX = dx / length
      const dirZ = dz / length
      const perpX = -dz / length
      const perpZ = dx / length
      const halfW = def.width / 2 + SIDEWALK_WIDTH

      // Road deck
      this._createDeck(group, def, length, halfW, colors.deck)

      // Sidewalk strips (slightly raised edges)
      this._createSidewalkStrips(group, def, length, halfW, dirX, dirZ, perpX, perpZ)

      // Side barrier walls
      this._createBarrierWalls(group, def, length, halfW, perpX, perpZ, colors.barrier, collision)

      // Towers
      this._createTowers(group, def, length, halfW, dirX, dirZ, perpX, perpZ, colors.tower)

      // Style-specific decorations
      if (def.style === 'gothic') {
        this._createSuspensionCables(group, def, length, halfW, dirX, dirZ, perpX, perpZ, colors.cable)
      } else if (def.style === 'suspension') {
        this._createSuspensionCables(group, def, length, halfW, dirX, dirZ, perpX, perpZ, colors.cable)
      } else if (def.style === 'truss') {
        this._createTruss(group, def, length, halfW, dirX, dirZ, perpX, perpZ, colors.tower)
      }

      scene.add(group)
    }
  }

  _createDeck(group, def, length, halfW, color) {
    const positions = []
    const indices = []
    const dx = def.end.x - def.start.x
    const dz = def.end.z - def.start.z
    const perpX = -dz / length
    const perpZ = dx / length

    for (let i = 0; i <= DECK_SEGMENTS; i++) {
      const t = i / DECK_SEGMENTS
      const cx = def.start.x + dx * t
      const cz = def.start.z + dz * t
      const y = this.elevation.getElevation(cx, cz) + 0.02

      // Left and right vertices
      positions.push(cx + perpX * halfW, y, cz + perpZ * halfW)
      positions.push(cx - perpX * halfW, y, cz - perpZ * halfW)
    }

    for (let i = 0; i < DECK_SEGMENTS; i++) {
      const v0 = i * 2
      const v1 = i * 2 + 1
      const v2 = (i + 1) * 2
      const v3 = (i + 1) * 2 + 1
      indices.push(v0, v2, v1)
      indices.push(v1, v2, v3)
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setIndex(indices)
    const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })
    group.add(new THREE.Mesh(geo, mat))
  }

  _createSidewalkStrips(group, def, length, halfW, dirX, dirZ, perpX, perpZ) {
    const dx = def.end.x - def.start.x
    const dz = def.end.z - def.start.z
    const swWidth = SIDEWALK_WIDTH
    const roadHalfW = def.width / 2
    const mat = new THREE.MeshBasicMaterial({ color: PALETTE.sidewalk, side: THREE.DoubleSide })

    for (const side of [-1, 1]) {
      const positions = []
      const indices = []

      for (let i = 0; i <= DECK_SEGMENTS; i++) {
        const t = i / DECK_SEGMENTS
        const cx = def.start.x + dx * t
        const cz = def.start.z + dz * t
        const y = this.elevation.getElevation(cx, cz) + 0.08

        const innerX = cx + perpX * roadHalfW * side
        const innerZ = cz + perpZ * roadHalfW * side
        const outerX = cx + perpX * halfW * side
        const outerZ = cz + perpZ * halfW * side

        positions.push(innerX, y, innerZ)
        positions.push(outerX, y, outerZ)
      }

      for (let i = 0; i < DECK_SEGMENTS; i++) {
        const v0 = i * 2
        const v1 = i * 2 + 1
        const v2 = (i + 1) * 2
        const v3 = (i + 1) * 2 + 1
        indices.push(v0, v2, v1)
        indices.push(v1, v2, v3)
      }

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      geo.setIndex(indices)
      group.add(new THREE.Mesh(geo, mat))
    }
  }

  _createBarrierWalls(group, def, length, halfW, perpX, perpZ, color, collision) {
    const dx = def.end.x - def.start.x
    const dz = def.end.z - def.start.z
    const mat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })

    for (const side of [-1, 1]) {
      const positions = []
      const indices = []

      for (let i = 0; i <= DECK_SEGMENTS; i++) {
        const t = i / DECK_SEGMENTS
        const cx = def.start.x + dx * t
        const cz = def.start.z + dz * t
        const y = this.elevation.getElevation(cx, cz)
        const wx = cx + perpX * halfW * side
        const wz = cz + perpZ * halfW * side

        // Bottom vertex
        positions.push(wx, y, wz)
        // Top vertex
        positions.push(wx, y + BARRIER_HEIGHT, wz)
      }

      for (let i = 0; i < DECK_SEGMENTS; i++) {
        const b0 = i * 2
        const t0 = i * 2 + 1
        const b1 = (i + 1) * 2
        const t1 = (i + 1) * 2 + 1
        indices.push(b0, b1, t0)
        indices.push(t0, b1, t1)
      }

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
      geo.setIndex(indices)
      group.add(new THREE.Mesh(geo, mat))
    }

    // Collision bodies for barriers (split into chunks along bridge)
    const chunks = 5
    for (let c = 0; c < chunks; c++) {
      const t0 = c / chunks
      const t1 = (c + 1) / chunks
      const tc = (t0 + t1) / 2
      const cx = def.start.x + dx * tc
      const cz = def.start.z + dz * tc
      const minElev = Math.min(
        this.elevation.getElevation(def.start.x + dx * t0, def.start.z + dz * t0),
        this.elevation.getElevation(def.start.x + dx * t1, def.start.z + dz * t1)
      )
      const maxElev = Math.max(
        this.elevation.getElevation(def.start.x + dx * t0, def.start.z + dz * t0),
        this.elevation.getElevation(def.start.x + dx * t1, def.start.z + dz * t1)
      ) + BARRIER_HEIGHT

      const segLen = length / chunks
      for (const side of [-1, 1]) {
        const bx = cx + perpX * halfW * side
        const bz = cz + perpZ * halfW * side
        // Barriers run along the bridge direction
        // For east-west bridges: extend in X, thin in Z
        const hx = segLen / 2 + 1
        const hz = 0.5
        collision.addStaticBody(
          bx - hx, bz - hz, bx + hx, bz + hz,
          minElev - 1, maxElev + 1
        )
      }
    }
  }

  _createTowers(group, def, length, halfW, dirX, dirZ, perpX, perpZ, color) {
    const mat = new THREE.MeshBasicMaterial({ color })

    for (const tFrac of [0.33, 0.67]) {
      const tx = def.start.x + (def.end.x - def.start.x) * tFrac
      const tz = def.start.z + (def.end.z - def.start.z) * tFrac
      const baseY = this.elevation.getElevation(tx, tz)
      const angle = Math.atan2(def.end.x - def.start.x, def.end.z - def.start.z)

      if (def.style === 'gothic') {
        // Gothic arch: two narrow pillars per side + connecting top
        const pillarW = 0.8
        const pillarD = 1.5
        const towerH = def.height + 18
        const pillarGeo = new THREE.BoxGeometry(pillarW, towerH, pillarD)
        const topGeo = new THREE.BoxGeometry(pillarW, 3, 5)

        for (const side of [-1, 1]) {
          const sx = tx + perpX * (halfW + 0.5) * side
          const sz = tz + perpZ * (halfW + 0.5) * side

          // Two pillars (offset along bridge direction)
          for (const off of [-1.8, 1.8]) {
            const px = sx + dirX * off
            const pz = sz + dirZ * off
            const pillar = new THREE.Mesh(pillarGeo, mat)
            pillar.position.set(px, baseY + towerH / 2, pz)
            pillar.rotation.y = angle
            group.add(pillar)
          }

          // Connecting arch top
          const top = new THREE.Mesh(topGeo, mat)
          top.position.set(sx, baseY + towerH - 1.5, sz)
          top.rotation.y = angle
          group.add(top)

          // Pointed top piece
          const pointGeo = new THREE.ConeGeometry(1.5, 4, 4)
          const point = new THREE.Mesh(pointGeo, mat)
          point.position.set(sx, baseY + towerH + 2, sz)
          point.rotation.y = angle
          group.add(point)
        }
      } else if (def.style === 'suspension') {
        // Rectangular steel towers
        const towerW = 2
        const towerD = 3
        const towerH = def.height + 15
        const towerGeo = new THREE.BoxGeometry(towerW, towerH, towerD)

        for (const side of [-1, 1]) {
          const sx = tx + perpX * (halfW + 0.5) * side
          const sz = tz + perpZ * (halfW + 0.5) * side
          const tower = new THREE.Mesh(towerGeo, mat)
          tower.position.set(sx, baseY + towerH / 2, sz)
          tower.rotation.y = angle
          group.add(tower)
        }

        // Cross beam between towers at top
        const beamLength = halfW * 2 + 1
        const beamGeo = new THREE.BoxGeometry(1, 1.5, beamLength)
        const beam = new THREE.Mesh(beamGeo, mat)
        beam.position.set(tx, baseY + towerH - 2, tz)
        beam.rotation.y = angle
        group.add(beam)
      } else {
        // Truss: lattice tower frames
        const towerW = 1.5
        const towerD = 2
        const towerH = def.height + 10
        const towerGeo = new THREE.BoxGeometry(towerW, towerH, towerD)

        for (const side of [-1, 1]) {
          const sx = tx + perpX * (halfW + 0.5) * side
          const sz = tz + perpZ * (halfW + 0.5) * side
          const tower = new THREE.Mesh(towerGeo, mat)
          tower.position.set(sx, baseY + towerH / 2, sz)
          tower.rotation.y = angle
          group.add(tower)
        }
      }
    }
  }

  _createSuspensionCables(group, def, length, halfW, dirX, dirZ, perpX, perpZ, color) {
    const mat = new THREE.MeshBasicMaterial({ color })
    const dx = def.end.x - def.start.x
    const dz = def.end.z - def.start.z

    // Tower positions and heights
    const towerFracs = [0.33, 0.67]
    const towerTopY = def.height + (def.style === 'gothic' ? 18 : 15)

    for (const side of [-1, 1]) {
      // Main cable: parabola from tower to tower, with sag down to near deck level
      const cablePoints = []
      const numPoints = 30

      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints
        const cx = def.start.x + dx * t
        const cz = def.start.z + dz * t
        const deckY = this.elevation.getElevation(cx, cz)
        const wx = cx + perpX * halfW * side
        const wz = cz + perpZ * halfW * side

        // Cable Y: interpolate between tower tops with parabolic sag
        let cableY
        if (t < towerFracs[0]) {
          // Approach to first tower: from deck+2 up to tower top
          const lt = t / towerFracs[0]
          cableY = deckY + 2 + (towerTopY - 2) * lt
        } else if (t > towerFracs[1]) {
          // Descent from second tower: from tower top down to deck+2
          const lt = (t - towerFracs[1]) / (1 - towerFracs[1])
          cableY = deckY + towerTopY - (towerTopY - 2) * lt
        } else {
          // Between towers: parabolic sag
          const lt = (t - towerFracs[0]) / (towerFracs[1] - towerFracs[0])
          const sag = 4 * lt * (1 - lt) * (towerTopY * 0.3) // sag amount
          cableY = deckY + towerTopY - sag
        }

        cablePoints.push(new THREE.Vector3(wx, cableY, wz))
      }

      // Create cable as connected cylinders
      for (let i = 0; i < cablePoints.length - 1; i++) {
        const p0 = cablePoints[i]
        const p1 = cablePoints[i + 1]
        const mid = new THREE.Vector3().addVectors(p0, p1).multiplyScalar(0.5)
        const segLen = p0.distanceTo(p1)
        const dir = new THREE.Vector3().subVectors(p1, p0).normalize()

        const cableGeo = new THREE.CylinderGeometry(0.08, 0.08, segLen, 3)
        const cable = new THREE.Mesh(cableGeo, mat)
        cable.position.copy(mid)

        // Orient cylinder along cable direction
        const up = new THREE.Vector3(0, 1, 0)
        const quat = new THREE.Quaternion().setFromUnitVectors(up, dir)
        cable.quaternion.copy(quat)
        group.add(cable)
      }

      // Vertical suspender cables (between main cable and deck)
      const suspenderSpacing = length / 15
      for (let i = 1; i < 15; i++) {
        const t = i / 15
        if (t < 0.1 || t > 0.9) continue // skip near endpoints

        const cx = def.start.x + dx * t
        const cz = def.start.z + dz * t
        const wx = cx + perpX * halfW * side
        const wz = cz + perpZ * halfW * side
        const deckY = this.elevation.getElevation(cx, cz)

        // Find cable Y at this position (approximate)
        let cableY
        if (t < towerFracs[0]) {
          const lt = t / towerFracs[0]
          cableY = deckY + 2 + (towerTopY - 2) * lt
        } else if (t > towerFracs[1]) {
          const lt = (t - towerFracs[1]) / (1 - towerFracs[1])
          cableY = deckY + towerTopY - (towerTopY - 2) * lt
        } else {
          const lt = (t - towerFracs[0]) / (towerFracs[1] - towerFracs[0])
          const sag = 4 * lt * (1 - lt) * (towerTopY * 0.3)
          cableY = deckY + towerTopY - sag
        }

        const suspLen = cableY - deckY - BARRIER_HEIGHT
        if (suspLen < 1) continue

        const suspGeo = new THREE.CylinderGeometry(0.03, 0.03, suspLen, 3)
        const susp = new THREE.Mesh(suspGeo, mat)
        susp.position.set(wx, deckY + BARRIER_HEIGHT + suspLen / 2, wz)
        group.add(susp)
      }
    }
  }

  _createTruss(group, def, length, halfW, dirX, dirZ, perpX, perpZ, color) {
    const mat = new THREE.MeshBasicMaterial({ color })
    const dx = def.end.x - def.start.x
    const dz = def.end.z - def.start.z
    const trussHeight = 6
    const postSpacing = length / 12

    for (const side of [-1, 1]) {
      // Vertical posts along bridge edge
      for (let i = 0; i <= 12; i++) {
        const t = i / 12
        if (t < 0.05 || t > 0.95) continue

        const cx = def.start.x + dx * t
        const cz = def.start.z + dz * t
        const wx = cx + perpX * (halfW + 0.3) * side
        const wz = cz + perpZ * (halfW + 0.3) * side
        const baseY = this.elevation.getElevation(cx, cz)

        // Vertical post
        const postGeo = new THREE.BoxGeometry(0.3, trussHeight, 0.3)
        const post = new THREE.Mesh(postGeo, mat)
        post.position.set(wx, baseY + trussHeight / 2, wz)
        group.add(post)
      }

      // Top horizontal rail
      const railPoints = []
      for (let i = 0; i <= DECK_SEGMENTS; i++) {
        const t = i / DECK_SEGMENTS
        if (t < 0.05 || t > 0.95) continue
        const cx = def.start.x + dx * t
        const cz = def.start.z + dz * t
        const wx = cx + perpX * (halfW + 0.3) * side
        const wz = cz + perpZ * (halfW + 0.3) * side
        const y = this.elevation.getElevation(cx, cz) + trussHeight
        railPoints.push(new THREE.Vector3(wx, y, wz))
      }

      // Create top rail as connected segments
      for (let i = 0; i < railPoints.length - 1; i++) {
        const p0 = railPoints[i]
        const p1 = railPoints[i + 1]
        const mid = new THREE.Vector3().addVectors(p0, p1).multiplyScalar(0.5)
        const segLen = p0.distanceTo(p1)
        const dir = new THREE.Vector3().subVectors(p1, p0).normalize()

        const railGeo = new THREE.BoxGeometry(0.2, 0.2, segLen)
        const rail = new THREE.Mesh(railGeo, mat)
        rail.position.copy(mid)
        const up = new THREE.Vector3(0, 0, 1)
        const quat = new THREE.Quaternion().setFromUnitVectors(up, dir)
        rail.quaternion.copy(quat)
        group.add(rail)
      }

      // Diagonal cross-braces between posts
      for (let i = 0; i < 12; i++) {
        const t0 = i / 12
        const t1 = (i + 1) / 12
        if (t0 < 0.05 || t1 > 0.95) continue

        const cx0 = def.start.x + dx * t0
        const cz0 = def.start.z + dz * t0
        const cx1 = def.start.x + dx * t1
        const cz1 = def.start.z + dz * t1

        const wx0 = cx0 + perpX * (halfW + 0.3) * side
        const wz0 = cz0 + perpZ * (halfW + 0.3) * side
        const wx1 = cx1 + perpX * (halfW + 0.3) * side
        const wz1 = cz1 + perpZ * (halfW + 0.3) * side

        const y0 = this.elevation.getElevation(cx0, cz0)
        const y1 = this.elevation.getElevation(cx1, cz1)

        // X-brace: bottom-left to top-right
        const p0 = new THREE.Vector3(wx0, y0 + BARRIER_HEIGHT, wz0)
        const p1 = new THREE.Vector3(wx1, y1 + trussHeight, wz1)
        const mid = new THREE.Vector3().addVectors(p0, p1).multiplyScalar(0.5)
        const braceLen = p0.distanceTo(p1)
        const dir = new THREE.Vector3().subVectors(p1, p0).normalize()

        const braceGeo = new THREE.BoxGeometry(0.15, 0.15, braceLen)
        const brace = new THREE.Mesh(braceGeo, mat)
        brace.position.copy(mid)
        const up = new THREE.Vector3(0, 0, 1)
        const quat = new THREE.Quaternion().setFromUnitVectors(up, dir)
        brace.quaternion.copy(quat)
        group.add(brace)
      }
    }
  }
}
