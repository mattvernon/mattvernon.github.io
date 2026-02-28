import * as THREE from 'three'
import InstanceManager from '../InstanceManager.js'
import { LAMP_HEIGHT, PALETTE } from '../../constants.js'

const PARK_GREEN = '#1a3a1a'
const PATH_COLOR = '#3a3a2a'
const TREE_TRUNK_COLOR = '#3a2a1a'
const TREE_CANOPY_COLORS = ['#1a4a1a', '#1a5a1a', '#2a5a2a', '#1a4a2a']
const POND_COLOR = '#0a2035'
const PARK_LAMP_COLOR = '#ffaa44'

export default class CentralParkBuilder {
  constructor(elevationSystem, parkBounds) {
    this.elevation = elevationSystem
    this.bounds = parkBounds
  }

  build(scene, collision) {
    const group = new THREE.Group()
    const b = this.bounds

    const w = b.maxX - b.minX
    const d = b.maxZ - b.minZ
    const cx = (b.minX + b.maxX) / 2
    const cz = (b.minZ + b.maxZ) / 2

    // Green ground
    const groundGeo = new THREE.PlaneGeometry(w, d)
    const groundMat = new THREE.MeshBasicMaterial({ color: PARK_GREEN })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.position.set(cx, 0.005, cz)
    group.add(ground)

    // Small pond near center
    const pondW = 30
    const pondD = 18
    const pondGeo = new THREE.PlaneGeometry(pondW, pondD)
    const pondMat = new THREE.MeshBasicMaterial({
      color: POND_COLOR,
      transparent: true,
      opacity: 0.85,
    })
    const pond = new THREE.Mesh(pondGeo, pondMat)
    pond.rotation.x = -Math.PI / 2
    pond.position.set(cx - 40, 0.01, cz + 60)
    group.add(pond)

    // Park paths (narrow road segments through the park)
    this._createPaths(group)

    // Instanced trees
    this._createTrees(group, collision)

    // Path lamps and ambient glow
    this._createPathLamps(group)

    // Pond glow highlights
    this._createPondGlow(group)

    // Moonlight wash
    this._createMoonlightWash(group)

    // Park boundary walls
    this._createBoundaryCollision(collision)

    scene.add(group)
  }

  _createPaths(group) {
    const b = this.bounds
    const cx = (b.minX + b.maxX) / 2
    const pathMat = new THREE.MeshBasicMaterial({ color: PATH_COLOR })

    // Main north-south path through center
    const nsW = 6
    const nsD = b.maxZ - b.minZ - 20
    const nsGeo = new THREE.PlaneGeometry(nsW, nsD)
    const nsPath = new THREE.Mesh(nsGeo, pathMat)
    nsPath.rotation.x = -Math.PI / 2
    nsPath.position.set(cx, 0.015, (b.minZ + b.maxZ) / 2)
    group.add(nsPath)

    // East-west cross paths
    const crossZPositions = [b.minZ + 100, (b.minZ + b.maxZ) / 2, b.maxZ - 100]
    for (const z of crossZPositions) {
      const ewW = b.maxX - b.minX - 20
      const ewGeo = new THREE.PlaneGeometry(ewW, 5)
      const ewPath = new THREE.Mesh(ewGeo, pathMat)
      ewPath.rotation.x = -Math.PI / 2
      ewPath.position.set(cx, 0.015, z)
      group.add(ewPath)
    }

    // Winding diagonal path
    const diagPoints = []
    const steps = 20
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = b.minX + 30 + (b.maxX - b.minX - 60) * t
      const z = b.minZ + 50 + (b.maxZ - b.minZ - 100) * t + Math.sin(t * Math.PI * 3) * 30
      diagPoints.push({ x, z })
    }

    for (let i = 0; i < diagPoints.length - 1; i++) {
      const p0 = diagPoints[i]
      const p1 = diagPoints[i + 1]
      const dx = p1.x - p0.x
      const dz = p1.z - p0.z
      const len = Math.sqrt(dx * dx + dz * dz)
      const angle = Math.atan2(dx, dz)
      const segGeo = new THREE.PlaneGeometry(4, len)
      const seg = new THREE.Mesh(segGeo, pathMat)
      seg.rotation.x = -Math.PI / 2
      seg.rotation.z = -angle
      seg.position.set((p0.x + p1.x) / 2, 0.015, (p0.z + p1.z) / 2)
      group.add(seg)
    }
  }

  _createTrees(group, collision) {
    const b = this.bounds
    const instances = new InstanceManager()

    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 3, 5)
    const trunkMat = new THREE.MeshBasicMaterial({ color: TREE_TRUNK_COLOR })
    instances.register('trunk', trunkGeo, trunkMat)

    const smallCanopy = new THREE.SphereGeometry(2, 6, 5)
    const largeCanopy = new THREE.SphereGeometry(3, 6, 5)

    const canopyMats = TREE_CANOPY_COLORS.map(c =>
      new THREE.MeshBasicMaterial({ color: c })
    )
    instances.register('canopySmall', smallCanopy, canopyMats[0])
    instances.register('canopyLarge', largeCanopy, canopyMats[1])

    const cx = (b.minX + b.maxX) / 2
    const cz = (b.minZ + b.maxZ) / 2

    const treeCount = 120
    let placed = 0
    let attempts = 0

    while (placed < treeCount && attempts < 500) {
      attempts++
      const tx = b.minX + 10 + Math.random() * (b.maxX - b.minX - 20)
      const tz = b.minZ + 10 + Math.random() * (b.maxZ - b.minZ - 20)

      if (Math.abs(tx - cx) < 5) continue

      const crossZs = [b.minZ + 100, cz, b.maxZ - 100]
      let onPath = false
      for (const z of crossZs) {
        if (Math.abs(tz - z) < 4) { onPath = true; break }
      }
      if (onPath) continue

      if (Math.abs(tx - (cx - 40)) < 20 && Math.abs(tz - (cz + 60)) < 14) continue

      const isLarge = Math.random() > 0.5
      const trunkH = isLarge ? 4 : 3
      const canopyType = isLarge ? 'canopyLarge' : 'canopySmall'

      instances.add('trunk', tx, trunkH / 2, tz)
      instances.add(canopyType, tx, trunkH + (isLarge ? 2.5 : 1.8), tz)

      collision.addStaticBody(tx - 0.5, tz - 0.5, tx + 0.5, tz + 0.5)

      placed++
    }

    instances.build(group)
  }

  _createPathLamps(group) {
    const b = this.bounds
    const cx = (b.minX + b.maxX) / 2
    const cz = (b.minZ + b.maxZ) / 2
    const instances = new InstanceManager()

    const lampH = 5
    const poleGeo = new THREE.CylinderGeometry(0.06, 0.08, lampH, 5)
    const poleMat = new THREE.MeshBasicMaterial({ color: '#333344' })
    const headGeo = new THREE.SphereGeometry(0.2, 6, 6)
    const headMat = new THREE.MeshBasicMaterial({ color: PARK_LAMP_COLOR })
    const glowGeo = new THREE.CircleGeometry(4, 8)
    glowGeo.rotateX(-Math.PI / 2)
    const glowMat = new THREE.MeshBasicMaterial({
      color: PARK_LAMP_COLOR,
      transparent: true,
      opacity: 0.1,
    })

    instances.register('parkPole', poleGeo, poleMat)
    instances.register('parkHead', headGeo, headMat)
    instances.register('parkGlow', glowGeo, glowMat)

    const nsSpacing = 30
    for (let z = b.minZ + 20; z < b.maxZ - 20; z += nsSpacing) {
      for (const side of [-1, 1]) {
        const lx = cx + side * 4
        instances.add('parkPole', lx, lampH / 2, z)
        instances.add('parkHead', lx, lampH, z)
        instances.add('parkGlow', lx, 0.02, z)
      }
    }

    const crossZPositions = [b.minZ + 100, cz, b.maxZ - 100]
    const ewSpacing = 35
    for (const z of crossZPositions) {
      for (let x = b.minX + 20; x < b.maxX - 20; x += ewSpacing) {
        if (Math.abs(x - cx) < 8) continue
        const side = ((x / ewSpacing) | 0) % 2 === 0 ? 1 : -1
        instances.add('parkPole', x, lampH / 2, z + side * 3.5)
        instances.add('parkHead', x, lampH, z + side * 3.5)
        instances.add('parkGlow', x, 0.02, z + side * 3.5)
      }
    }

    instances.build(group)
  }

  _createPondGlow(group) {
    const b = this.bounds
    const cx = (b.minX + b.maxX) / 2
    const cz = (b.minZ + b.maxZ) / 2
    const pondCx = cx - 40
    const pondCz = cz + 60

    const highlightMat = new THREE.MeshBasicMaterial({
      color: '#2a4a6a',
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    })

    for (let i = 0; i < 8; i++) {
      const size = 2 + Math.random() * 4
      const geo = new THREE.PlaneGeometry(size, size * 0.6)
      const highlight = new THREE.Mesh(geo, highlightMat)
      highlight.rotation.x = -Math.PI / 2
      highlight.position.set(
        pondCx + (Math.random() - 0.5) * 24,
        0.015,
        pondCz + (Math.random() - 0.5) * 14
      )
      group.add(highlight)
    }
  }

  _createMoonlightWash(group) {
    const b = this.bounds
    const w = b.maxX - b.minX
    const d = b.maxZ - b.minZ
    const cx = (b.minX + b.maxX) / 2
    const cz = (b.minZ + b.maxZ) / 2

    const washGeo = new THREE.PlaneGeometry(w, d)
    const washMat = new THREE.MeshBasicMaterial({
      color: '#223344',
      transparent: true,
      opacity: 0.06,
      depthWrite: false,
    })
    const wash = new THREE.Mesh(washGeo, washMat)
    wash.rotation.x = -Math.PI / 2
    wash.position.set(cx, 0.008, cz)
    group.add(wash)
  }

  _createBoundaryCollision(collision) {
    // Buildings around the park perimeter already provide collision
  }
}
