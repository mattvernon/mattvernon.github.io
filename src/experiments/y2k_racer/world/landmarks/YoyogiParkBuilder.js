import * as THREE from 'three'
import InstanceManager from '../InstanceManager.js'

const PARK_GREEN = '#1a3a1a'
const GRAVEL_COLOR = '#4a4a3a'
const TREE_TRUNK_COLOR = '#3a2a1a'
const GREEN_CANOPY_COLORS = ['#1a4a1a', '#1a5a1a', '#2a5a2a']
const CHERRY_CANOPY_COLORS = ['#e8a0b0', '#d4899c', '#c47888']
const POND_COLOR = '#0a2035'
const TORII_RED = '#cc3333'
const LAMP_COLOR = '#ffaa44'

export default class YoyogiParkBuilder {
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

    // Gravel paths (Japanese garden style)
    this._createPaths(group)

    // Torii gate at south entrance
    this._createToriiGate(group)

    // Small shrine near center
    this._createShrine(group)

    // Pond
    this._createPond(group)

    // Trees (mix of cherry blossom and green)
    this._createTrees(group, collision)

    // Path lamps (Japanese lantern style — shorter, warmer)
    this._createPathLamps(group)

    // Moonlight wash
    this._createMoonlightWash(group)

    scene.add(group)
  }

  _createPaths(group) {
    const b = this.bounds
    const cx = (b.minX + b.maxX) / 2
    const cz = (b.minZ + b.maxZ) / 2
    const pathMat = new THREE.MeshBasicMaterial({ color: GRAVEL_COLOR })

    // Main north-south path
    const nsW = 5
    const nsD = b.maxZ - b.minZ - 20
    const nsGeo = new THREE.PlaneGeometry(nsW, nsD)
    const nsPath = new THREE.Mesh(nsGeo, pathMat)
    nsPath.rotation.x = -Math.PI / 2
    nsPath.position.set(cx, 0.015, cz)
    group.add(nsPath)

    // East-west cross paths
    const crossZPositions = [b.minZ + 80, cz, b.maxZ - 80]
    for (const z of crossZPositions) {
      const ewW = b.maxX - b.minX - 20
      const ewGeo = new THREE.PlaneGeometry(ewW, 4)
      const ewPath = new THREE.Mesh(ewGeo, pathMat)
      ewPath.rotation.x = -Math.PI / 2
      ewPath.position.set(cx, 0.015, z)
      group.add(ewPath)
    }

    // Winding path to shrine
    const diagPoints = []
    const steps = 15
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = b.minX + 30 + (b.maxX - b.minX - 60) * t
      const z = b.minZ + 40 + (b.maxZ - b.minZ - 80) * t + Math.sin(t * Math.PI * 2) * 25
      diagPoints.push({ x, z })
    }

    for (let i = 0; i < diagPoints.length - 1; i++) {
      const p0 = diagPoints[i]
      const p1 = diagPoints[i + 1]
      const dx = p1.x - p0.x
      const dz = p1.z - p0.z
      const len = Math.sqrt(dx * dx + dz * dz)
      const angle = Math.atan2(dx, dz)
      const segGeo = new THREE.PlaneGeometry(3.5, len)
      const seg = new THREE.Mesh(segGeo, pathMat)
      seg.rotation.x = -Math.PI / 2
      seg.rotation.z = -angle
      seg.position.set((p0.x + p1.x) / 2, 0.015, (p0.z + p1.z) / 2)
      group.add(seg)
    }
  }

  _createToriiGate(group) {
    const b = this.bounds
    const cx = (b.minX + b.maxX) / 2
    const gateZ = b.minZ + 15
    const mat = new THREE.MeshBasicMaterial({ color: TORII_RED })

    // Two pillars
    const pillarH = 8
    const pillarGeo = new THREE.CylinderGeometry(0.4, 0.5, pillarH, 6)
    for (const side of [-1, 1]) {
      const pillar = new THREE.Mesh(pillarGeo, mat)
      pillar.position.set(cx + side * 4, pillarH / 2, gateZ)
      group.add(pillar)
    }

    // Top beam (kasagi)
    const beamGeo = new THREE.BoxGeometry(12, 0.6, 0.8)
    const beam = new THREE.Mesh(beamGeo, mat)
    beam.position.set(cx, pillarH + 0.3, gateZ)
    group.add(beam)

    // Lower beam (nuki)
    const lowerBeamGeo = new THREE.BoxGeometry(9, 0.4, 0.5)
    const lowerBeam = new THREE.Mesh(lowerBeamGeo, mat)
    lowerBeam.position.set(cx, pillarH * 0.7, gateZ)
    group.add(lowerBeam)
  }

  _createShrine(group) {
    const b = this.bounds
    const cx = (b.minX + b.maxX) / 2
    const cz = (b.minZ + b.maxZ) / 2
    const shrineX = cx + 30
    const shrineZ = cz + 40

    // Main building
    const wallMat = new THREE.MeshBasicMaterial({ color: '#3a2a1a' })
    const wallGeo = new THREE.BoxGeometry(12, 5, 8)
    const wall = new THREE.Mesh(wallGeo, wallMat)
    wall.position.set(shrineX, 2.5, shrineZ)
    group.add(wall)

    // Roof (dark, slightly larger)
    const roofMat = new THREE.MeshBasicMaterial({ color: '#1a1a2a' })
    const roofGeo = new THREE.BoxGeometry(14, 0.5, 10)
    const roof = new THREE.Mesh(roofGeo, roofMat)
    roof.position.set(shrineX, 5.25, shrineZ)
    group.add(roof)

    // Roof peak (triangular shape approximated with a box)
    const peakGeo = new THREE.BoxGeometry(10, 2, 7)
    const peak = new THREE.Mesh(peakGeo, roofMat)
    peak.position.set(shrineX, 6.5, shrineZ)
    peak.rotation.z = 0 // flat for simplicity in low-poly style
    group.add(peak)

    // Upper roof
    const upperRoofGeo = new THREE.BoxGeometry(12, 0.4, 8)
    const upperRoof = new THREE.Mesh(upperRoofGeo, roofMat)
    upperRoof.position.set(shrineX, 7.7, shrineZ)
    group.add(upperRoof)

    // Small offering box in front
    const boxMat = new THREE.MeshBasicMaterial({ color: '#2a2a2a' })
    const boxGeo = new THREE.BoxGeometry(3, 1.5, 2)
    const box = new THREE.Mesh(boxGeo, boxMat)
    box.position.set(shrineX, 0.75, shrineZ - 6)
    group.add(box)

    // Lanterns flanking entrance (emissive for bloom)
    const lanternMat = new THREE.MeshBasicMaterial({ color: '#ffaa44' })
    const lanternGeo = new THREE.BoxGeometry(0.8, 2, 0.8)
    for (const side of [-1, 1]) {
      const lantern = new THREE.Mesh(lanternGeo, lanternMat)
      lantern.position.set(shrineX + side * 5, 1, shrineZ - 5)
      group.add(lantern)
    }
  }

  _createPond(group) {
    const b = this.bounds
    const cx = (b.minX + b.maxX) / 2
    const cz = (b.minZ + b.maxZ) / 2
    const pondCx = cx - 50
    const pondCz = cz - 30

    const pondW = 35
    const pondD = 20
    const pondGeo = new THREE.PlaneGeometry(pondW, pondD)
    const pondMat = new THREE.MeshBasicMaterial({
      color: POND_COLOR,
      transparent: true,
      opacity: 0.85,
    })
    const pond = new THREE.Mesh(pondGeo, pondMat)
    pond.rotation.x = -Math.PI / 2
    pond.position.set(pondCx, 0.01, pondCz)
    group.add(pond)

    // Pond glow highlights
    const highlightMat = new THREE.MeshBasicMaterial({
      color: '#2a4a6a',
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    })
    for (let i = 0; i < 10; i++) {
      const size = 2 + Math.random() * 5
      const geo = new THREE.PlaneGeometry(size, size * 0.5)
      const highlight = new THREE.Mesh(geo, highlightMat)
      highlight.rotation.x = -Math.PI / 2
      highlight.position.set(
        pondCx + (Math.random() - 0.5) * pondW * 0.8,
        0.015,
        pondCz + (Math.random() - 0.5) * pondD * 0.8
      )
      group.add(highlight)
    }
  }

  _createTrees(group, collision) {
    const b = this.bounds
    const cx = (b.minX + b.maxX) / 2
    const cz = (b.minZ + b.maxZ) / 2
    const instances = new InstanceManager()

    const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 3, 5)
    const trunkMat = new THREE.MeshBasicMaterial({ color: TREE_TRUNK_COLOR })
    instances.register('trunk', trunkGeo, trunkMat)

    // Green canopies
    const smallGreenCanopy = new THREE.SphereGeometry(2, 6, 5)
    const largeGreenCanopy = new THREE.SphereGeometry(3, 6, 5)
    const greenMat = new THREE.MeshBasicMaterial({ color: GREEN_CANOPY_COLORS[0] })
    instances.register('greenSmall', smallGreenCanopy, greenMat)
    instances.register('greenLarge', largeGreenCanopy, new THREE.MeshBasicMaterial({ color: GREEN_CANOPY_COLORS[1] }))

    // Cherry blossom canopies (pink)
    const smallCherryCanopy = new THREE.SphereGeometry(2.2, 6, 5)
    const largeCherryCanopy = new THREE.SphereGeometry(3.2, 6, 5)
    const cherryMat1 = new THREE.MeshBasicMaterial({ color: CHERRY_CANOPY_COLORS[0] })
    const cherryMat2 = new THREE.MeshBasicMaterial({ color: CHERRY_CANOPY_COLORS[1] })
    instances.register('cherrySmall', smallCherryCanopy, cherryMat1)
    instances.register('cherryLarge', largeCherryCanopy, cherryMat2)

    const treeCount = 150
    let placed = 0
    let attempts = 0

    // Pond position for avoidance
    const pondCx = cx - 50
    const pondCz = cz - 30

    // Shrine position for avoidance
    const shrineCx = cx + 30
    const shrineCz = cz + 40

    while (placed < treeCount && attempts < 600) {
      attempts++
      const tx = b.minX + 8 + Math.random() * (b.maxX - b.minX - 16)
      const tz = b.minZ + 8 + Math.random() * (b.maxZ - b.minZ - 16)

      // Skip if on main path
      if (Math.abs(tx - cx) < 4) continue

      // Skip if on cross paths
      const crossZs = [b.minZ + 80, cz, b.maxZ - 80]
      let onPath = false
      for (const z of crossZs) {
        if (Math.abs(tz - z) < 3.5) { onPath = true; break }
      }
      if (onPath) continue

      // Skip pond area
      if (Math.abs(tx - pondCx) < 22 && Math.abs(tz - pondCz) < 15) continue

      // Skip shrine area
      if (Math.abs(tx - shrineCx) < 10 && Math.abs(tz - shrineCz) < 10) continue

      // Skip torii gate area
      if (Math.abs(tx - cx) < 7 && tz < b.minZ + 25) continue

      const isCherryBlossom = Math.random() < 0.35
      const isLarge = Math.random() > 0.5
      const trunkH = isLarge ? 4 : 3

      instances.add('trunk', tx, trunkH / 2, tz)

      if (isCherryBlossom) {
        const canopyType = isLarge ? 'cherryLarge' : 'cherrySmall'
        instances.add(canopyType, tx, trunkH + (isLarge ? 2.8 : 2), tz)
      } else {
        const canopyType = isLarge ? 'greenLarge' : 'greenSmall'
        instances.add(canopyType, tx, trunkH + (isLarge ? 2.5 : 1.8), tz)
      }

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

    // Shorter Japanese-style lamps
    const lampH = 3.5
    const poleGeo = new THREE.CylinderGeometry(0.05, 0.07, lampH, 5)
    const poleMat = new THREE.MeshBasicMaterial({ color: '#2a2a2a' })
    // Square lantern head
    const headGeo = new THREE.BoxGeometry(0.5, 0.6, 0.5)
    const headMat = new THREE.MeshBasicMaterial({ color: LAMP_COLOR })
    const glowGeo = new THREE.CircleGeometry(3, 8)
    glowGeo.rotateX(-Math.PI / 2)
    const glowMat = new THREE.MeshBasicMaterial({
      color: LAMP_COLOR,
      transparent: true,
      opacity: 0.08,
    })

    instances.register('parkPole', poleGeo, poleMat)
    instances.register('parkHead', headGeo, headMat)
    instances.register('parkGlow', glowGeo, glowMat)

    // Lamps along N-S path
    const nsSpacing = 25
    for (let z = b.minZ + 20; z < b.maxZ - 20; z += nsSpacing) {
      for (const side of [-1, 1]) {
        const lx = cx + side * 3.5
        instances.add('parkPole', lx, lampH / 2, z)
        instances.add('parkHead', lx, lampH, z)
        instances.add('parkGlow', lx, 0.02, z)
      }
    }

    // Lamps along cross paths
    const crossZPositions = [b.minZ + 80, cz, b.maxZ - 80]
    const ewSpacing = 30
    for (const z of crossZPositions) {
      for (let x = b.minX + 15; x < b.maxX - 15; x += ewSpacing) {
        if (Math.abs(x - cx) < 6) continue
        const side = ((x / ewSpacing) | 0) % 2 === 0 ? 1 : -1
        instances.add('parkPole', x, lampH / 2, z + side * 3)
        instances.add('parkHead', x, lampH, z + side * 3)
        instances.add('parkGlow', x, 0.02, z + side * 3)
      }
    }

    instances.build(group)
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
}
