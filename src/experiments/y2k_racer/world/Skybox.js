import * as THREE from 'three'
import { PALETTE, FOG_DENSITY } from '../constants.js'

export function createSky(scene) {
  // No dynamic lights needed - all materials are MeshBasicMaterial.
  // The bloom pass handles glow from emissive surfaces.

  // Star particles (larger dome for bigger map)
  const starCount = 800
  const starGeo = new THREE.BufferGeometry()
  const positions = new Float32Array(starCount * 3)
  const sizes = new Float32Array(starCount)

  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI * 0.4 // upper hemisphere only
    const r = 500

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.cos(phi) + 100
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

  // Fog (reduced density for larger map)
  scene.fog = new THREE.FogExp2(PALETTE.fog, FOG_DENSITY)
  scene.background = new THREE.Color(PALETTE.sky)

  return { stars }
}
