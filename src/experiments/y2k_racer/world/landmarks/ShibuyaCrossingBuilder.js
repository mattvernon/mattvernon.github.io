import * as THREE from 'three'
import { NEON_COLORS } from '../../constants.js'

export default class ShibuyaCrossingBuilder {
  constructor(bounds) {
    this.bounds = bounds
  }

  build(scene) {
    const group = new THREE.Group()
    const b = this.bounds
    const cx = (b.minX + b.maxX) / 2
    const cz = (b.minZ + b.maxZ) / 2

    // Scramble crosswalk strips
    this._createCrosswalkStrips(group, b, cx, cz)

    // Large video screen billboards
    this._createBillboards(group, b)

    // Neon ground glow
    this._createGroundGlow(group, b)

    scene.add(group)
  }

  _createCrosswalkStrips(group, bounds, cx, cz) {
    const stripMat = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.18,
    })

    const { minX, maxX, minZ, maxZ } = bounds
    const w = maxX - minX
    const d = maxZ - minZ

    // Horizontal crossing strips (E-W)
    for (let z = minZ + 20; z < maxZ; z += 30) {
      for (let x = minX + 5; x < maxX - 5; x += 4) {
        const stripGeo = new THREE.PlaneGeometry(2.5, 0.8)
        const strip = new THREE.Mesh(stripGeo, stripMat)
        strip.rotation.x = -Math.PI / 2
        strip.position.set(x, 0.03, z)
        group.add(strip)
      }
    }

    // Vertical crossing strips (N-S)
    for (let x = minX + 20; x < maxX; x += 30) {
      for (let z = minZ + 5; z < maxZ - 5; z += 4) {
        const stripGeo = new THREE.PlaneGeometry(0.8, 2.5)
        const strip = new THREE.Mesh(stripGeo, stripMat)
        strip.rotation.x = -Math.PI / 2
        strip.position.set(x, 0.03, z)
        group.add(strip)
      }
    }

    // Diagonal scramble strips (the famous Shibuya crossing pattern)
    const diagMat = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.12,
    })
    const diagLen = Math.sqrt(w * w + d * d) * 0.4
    const diagCount = 12
    for (let i = 0; i < diagCount; i++) {
      const t = (i + 0.5) / diagCount
      const stripGeo = new THREE.PlaneGeometry(0.6, 3)
      const strip = new THREE.Mesh(stripGeo, diagMat)
      strip.rotation.x = -Math.PI / 2
      strip.rotation.z = -Math.PI / 4
      strip.position.set(
        cx + (t - 0.5) * w * 0.6,
        0.035,
        cz + (t - 0.5) * d * 0.6
      )
      group.add(strip)

      // Other diagonal
      const strip2 = new THREE.Mesh(stripGeo.clone(), diagMat)
      strip2.rotation.x = -Math.PI / 2
      strip2.rotation.z = Math.PI / 4
      strip2.position.set(
        cx + (t - 0.5) * w * 0.6,
        0.035,
        cz - (t - 0.5) * d * 0.6
      )
      group.add(strip2)
    }
  }

  _createBillboards(group, bounds) {
    const { minX, maxX, minZ, maxZ } = bounds

    // Large video screens — Shibuya is famous for massive displays
    const billboardDefs = [
      { x: minX + 10, z: minZ + 30, rot: 0, w: 22, h: 14 },
      { x: maxX - 10, z: minZ + 60, rot: Math.PI, w: 24, h: 16 },
      { x: minX + 20, z: maxZ - 20, rot: 0, w: 18, h: 12 },
      { x: maxX - 15, z: maxZ - 40, rot: Math.PI, w: 20, h: 14 },
      { x: (minX + maxX) / 2, z: minZ + 10, rot: Math.PI / 2, w: 16, h: 10 },
      { x: (minX + maxX) / 2 + 20, z: maxZ - 10, rot: -Math.PI / 2, w: 18, h: 12 },
      { x: minX + 5, z: (minZ + maxZ) / 2, rot: Math.PI * 0.1, w: 14, h: 10 },
      { x: maxX - 5, z: (minZ + maxZ) / 2, rot: Math.PI * 0.9, w: 16, h: 12 },
    ]

    for (const def of billboardDefs) {
      this._createBillboard(group, def.x, def.z, def.rot, def.w, def.h)
    }
  }

  _createBillboard(group, x, z, rotation, width, height) {
    const baseY = 12 + Math.random() * 25

    // Billboard frame
    const frameMat = new THREE.MeshBasicMaterial({ color: '#1a1a1a' })
    const frameGeo = new THREE.BoxGeometry(width + 0.6, height + 0.6, 0.4)
    const frame = new THREE.Mesh(frameGeo, frameMat)
    frame.position.set(x, baseY + height / 2, z)
    frame.rotation.y = rotation
    group.add(frame)

    // Billboard face (bright neon)
    const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)]
    const faceMat = new THREE.MeshBasicMaterial({ color })
    const faceGeo = new THREE.PlaneGeometry(width, height)
    const face = new THREE.Mesh(faceGeo, faceMat)
    face.position.set(x, baseY + height / 2, z)
    face.rotation.y = rotation
    face.translateZ(0.25)
    group.add(face)

    // Content stripes
    const stripCount = 3 + Math.floor(Math.random() * 3)
    for (let i = 0; i < stripCount; i++) {
      const stripColor = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)]
      const stripH = 0.6 + Math.random() * 2
      const stripW = width * (0.2 + Math.random() * 0.6)
      const stripY = baseY + (height * 0.15) + Math.random() * (height * 0.7)
      const stripMat = new THREE.MeshBasicMaterial({ color: stripColor })
      const stripGeo = new THREE.PlaneGeometry(stripW, stripH)
      const strip = new THREE.Mesh(stripGeo, stripMat)
      strip.position.set(x, stripY, z)
      strip.rotation.y = rotation
      strip.translateZ(0.3)
      group.add(strip)
    }

    // Support pole
    const poleMat = new THREE.MeshBasicMaterial({ color: '#222222' })
    const poleGeo = new THREE.CylinderGeometry(0.25, 0.25, baseY, 5)
    const pole = new THREE.Mesh(poleGeo, poleMat)
    pole.position.set(x, baseY / 2, z)
    group.add(pole)
  }

  _createGroundGlow(group, bounds) {
    const { minX, maxX, minZ, maxZ } = bounds

    // Pink neon strips
    const pinkMat = new THREE.MeshBasicMaterial({
      color: '#ff006e',
      transparent: true,
      opacity: 0.15,
    })
    for (let z = minZ + 8; z < maxZ; z += 15) {
      const w = maxX - minX
      const stripGeo = new THREE.PlaneGeometry(w, 1.2)
      const strip = new THREE.Mesh(stripGeo, pinkMat)
      strip.rotation.x = -Math.PI / 2
      strip.position.set((minX + maxX) / 2, 0.04, z)
      group.add(strip)
    }

    // Cyan accent strips
    const cyanMat = new THREE.MeshBasicMaterial({
      color: '#00f0ff',
      transparent: true,
      opacity: 0.1,
    })
    for (let x = minX + 15; x < maxX; x += 20) {
      const d = maxZ - minZ
      const stripGeo = new THREE.PlaneGeometry(0.8, d)
      const strip = new THREE.Mesh(stripGeo, cyanMat)
      strip.rotation.x = -Math.PI / 2
      strip.position.set(x, 0.045, (minZ + maxZ) / 2)
      group.add(strip)
    }
  }
}
