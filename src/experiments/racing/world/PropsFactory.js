import * as THREE from 'three'
import { LAMP_HEIGHT, PALETTE } from '../constants.js'

// Shared geometries and materials (created once, reused)
let _poleGeo, _poleMat, _headGeo, _headMat, _glowGeo, _glowMat

function ensureSharedAssets() {
  if (_poleGeo) return
  _poleGeo = new THREE.CylinderGeometry(0.08, 0.1, LAMP_HEIGHT, 5)
  _poleMat = new THREE.MeshBasicMaterial({ color: '#333344' })
  _headGeo = new THREE.SphereGeometry(0.25, 6, 6)
  _headMat = new THREE.MeshBasicMaterial({ color: PALETTE.streetLamp })
  // Small glow disc on the ground beneath lamp
  _glowGeo = new THREE.CircleGeometry(3, 8)
  _glowMat = new THREE.MeshBasicMaterial({
    color: PALETTE.streetLamp,
    transparent: true,
    opacity: 0.08,
  })
}

export function createStreetLamp(x, z) {
  ensureSharedAssets()
  const group = new THREE.Group()

  // Pole
  const pole = new THREE.Mesh(_poleGeo, _poleMat)
  pole.position.set(x, LAMP_HEIGHT / 2, z)
  group.add(pole)

  // Lamp head (emissive, picked up by bloom - no PointLight)
  const head = new THREE.Mesh(_headGeo, _headMat)
  head.position.set(x, LAMP_HEIGHT, z)
  group.add(head)

  // Ground glow disc (fake light pool)
  const glow = new THREE.Mesh(_glowGeo, _glowMat)
  glow.rotation.x = -Math.PI / 2
  glow.position.set(x, 0.02, z)
  group.add(glow)

  return group
}

export function createBarrier(x, z, rotation = 0) {
  const geo = new THREE.BoxGeometry(3, 0.8, 0.4)
  const mat = new THREE.MeshBasicMaterial({ color: '#cc8800' })
  const barrier = new THREE.Mesh(geo, mat)
  barrier.position.set(x, 0.4, z)
  barrier.rotation.y = rotation
  return barrier
}

export function createTrafficCone(x, z) {
  const group = new THREE.Group()

  const coneGeo = new THREE.ConeGeometry(0.2, 0.6, 6)
  const coneMat = new THREE.MeshBasicMaterial({ color: '#ff6600' })
  const cone = new THREE.Mesh(coneGeo, coneMat)
  cone.position.set(x, 0.3, z)
  group.add(cone)

  // White stripe
  const stripeGeo = new THREE.CylinderGeometry(0.18, 0.15, 0.08, 6)
  const stripeMat = new THREE.MeshBasicMaterial({ color: '#ffffff' })
  const stripe = new THREE.Mesh(stripeGeo, stripeMat)
  stripe.position.set(x, 0.35, z)
  group.add(stripe)

  return group
}
