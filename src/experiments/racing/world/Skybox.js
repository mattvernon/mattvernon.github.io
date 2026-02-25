import * as THREE from 'three'
import { PALETTE } from '../constants.js'

export function createSky(scene) {
  // No dynamic lights needed - all materials are MeshBasicMaterial.
  // The bloom pass handles glow from emissive surfaces.

  // Star particles
  const starCount = 500
  const starGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(starCount * 3)
  const sizes = new Float32Array(starCount)

  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI * 0.4 // upper hemisphere only
    const r = 200

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.cos(phi) + 50
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    sizes[i] = 0.5 + Math.random() * 1.5
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  starGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

  const starMat = new THREE.PointsMaterial({
    color: '#ffffff',
    size: 0.8,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.7,
  })

  const stars = new THREE.Points(starGeo, starMat)
  scene.add(stars)

  // Fog
  scene.fog = new THREE.FogExp2(PALETTE.fog, 0.012)
  scene.background = new THREE.Color(PALETTE.sky)

  return { stars }
}
