import * as THREE from 'three'
import { NEON_COLORS } from '../../constants.js'
import InstanceManager from '../InstanceManager.js'

// Times Square zone bounds (from MapData DISTRICT_ZONES)
const TS_BOUNDS = { minX: 330, maxX: 470, minZ: 30, maxZ: 200 }

export default class TimesSquareBuilder {
  build(scene) {
    const group = new THREE.Group()
    const b = TS_BOUNDS
    const cx = (b.minX + b.maxX) / 2
    const cz = (b.minZ + b.maxZ) / 2

    // Bright ground strips (emissive strips on the road for bloom)
    this._createGroundStrips(group, b)

    // Large billboard frames on building faces (freestanding billboards)
    this._createBillboards(group, b)

    // Triangular traffic island where Broadway crosses
    this._createTrafficIsland(group, cx, cz)

    scene.add(group)
  }

  _createGroundStrips(group, bounds) {
    const { minX, maxX, minZ, maxZ } = bounds
    const stripMat = new THREE.MeshBasicMaterial({
      color: '#ff006e',
      transparent: true,
      opacity: 0.15,
    })

    // Horizontal emissive strips across the roads
    for (let z = minZ + 10; z < maxZ; z += 20) {
      const w = maxX - minX
      const stripGeo = new THREE.PlaneGeometry(w, 1.5)
      const strip = new THREE.Mesh(stripGeo, stripMat)
      strip.rotation.x = -Math.PI / 2
      strip.position.set((minX + maxX) / 2, 0.03, z)
      group.add(strip)
    }

    // Brighter accent strips
    const accentMat = new THREE.MeshBasicMaterial({
      color: '#00f0ff',
      transparent: true,
      opacity: 0.1,
    })
    for (let x = minX + 20; x < maxX; x += 30) {
      const d = maxZ - minZ
      const stripGeo = new THREE.PlaneGeometry(1, d)
      const strip = new THREE.Mesh(stripGeo, accentMat)
      strip.rotation.x = -Math.PI / 2
      strip.position.set(x, 0.035, (minZ + maxZ) / 2)
      group.add(strip)
    }
  }

  _createBillboards(group, bounds) {
    const { minX, maxX, minZ, maxZ } = bounds

    // Place large freestanding billboards at key positions
    const billboardDefs = [
      { x: minX + 15, z: minZ + 40, rot: 0, w: 18, h: 10 },
      { x: maxX - 15, z: minZ + 80, rot: Math.PI, w: 20, h: 12 },
      { x: minX + 30, z: maxZ - 30, rot: 0, w: 16, h: 8 },
      { x: maxX - 20, z: maxZ - 50, rot: Math.PI, w: 22, h: 14 },
      { x: (minX + maxX) / 2, z: minZ + 15, rot: Math.PI / 2, w: 14, h: 8 },
      { x: (minX + maxX) / 2 - 30, z: (minZ + maxZ) / 2, rot: -0.3, w: 18, h: 10 },
    ]

    for (const def of billboardDefs) {
      this._createBillboard(group, def.x, def.z, def.rot, def.w, def.h)
    }
  }

  _createBillboard(group, x, z, rotation, width, height) {
    const baseY = 15 + Math.random() * 20 // elevated on buildings

    // Billboard frame (dark border)
    const frameMat = new THREE.MeshBasicMaterial({ color: '#222222' })
    const frameGeo = new THREE.BoxGeometry(width + 0.5, height + 0.5, 0.3)
    const frame = new THREE.Mesh(frameGeo, frameMat)
    frame.position.set(x, baseY + height / 2, z)
    frame.rotation.y = rotation
    group.add(frame)

    // Billboard face (bright neon color)
    const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)]
    const faceMat = new THREE.MeshBasicMaterial({ color })
    const faceGeo = new THREE.PlaneGeometry(width, height)
    const face = new THREE.Mesh(faceGeo, faceMat)
    face.position.set(x, baseY + height / 2, z)
    face.rotation.y = rotation
    // Offset slightly forward from frame
    face.translateZ(0.2)
    group.add(face)

    // Decorative stripes on billboard (simulate content)
    const stripCount = 2 + Math.floor(Math.random() * 3)
    for (let i = 0; i < stripCount; i++) {
      const stripColor = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)]
      const stripH = 0.8 + Math.random() * 1.5
      const stripW = width * (0.3 + Math.random() * 0.5)
      const stripY = baseY + (height * 0.2) + Math.random() * (height * 0.6)
      const stripMat = new THREE.MeshBasicMaterial({ color: stripColor })
      const stripGeo = new THREE.PlaneGeometry(stripW, stripH)
      const strip = new THREE.Mesh(stripGeo, stripMat)
      strip.position.set(x, stripY, z)
      strip.rotation.y = rotation
      strip.translateZ(0.25)
      group.add(strip)
    }

    // Support pole
    const poleMat = new THREE.MeshBasicMaterial({ color: '#333333' })
    const poleGeo = new THREE.CylinderGeometry(0.3, 0.3, baseY, 5)
    const pole = new THREE.Mesh(poleGeo, poleMat)
    pole.position.set(x, baseY / 2, z)
    group.add(pole)
  }

  _createTrafficIsland(group, centerX, centerZ) {
    // Triangular island where Broadway intersects — raised concrete triangle
    const islandMat = new THREE.MeshBasicMaterial({ color: '#3a3a4e' })

    // Create a triangular shape
    const shape = new THREE.Shape()
    const size = 8
    shape.moveTo(0, -size)
    shape.lineTo(-size * 0.7, size * 0.5)
    shape.lineTo(size * 0.7, size * 0.5)
    shape.closePath()

    const extrudeSettings = { depth: 0.3, bevelEnabled: false }
    const islandGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    const island = new THREE.Mesh(islandGeo, islandMat)
    island.rotation.x = -Math.PI / 2
    island.position.set(centerX, 0.1, centerZ + 30)
    group.add(island)

    // Bright neon border around island
    const borderMat = new THREE.MeshBasicMaterial({
      color: '#ff006e',
      transparent: true,
      opacity: 0.6,
    })
    const borderGeo = new THREE.RingGeometry(size * 0.8, size * 0.9, 3)
    const border = new THREE.Mesh(borderGeo, borderMat)
    border.rotation.x = -Math.PI / 2
    border.position.set(centerX, 0.15, centerZ + 30)
    group.add(border)
  }
}
