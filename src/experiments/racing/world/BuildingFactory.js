import * as THREE from 'three'
import {
  PALETTE,
  NEON_COLORS,
  MIN_BUILDING_HEIGHT,
  MAX_BUILDING_HEIGHT,
  LIT_WINDOW_CHANCE,
  NEON_SIGN_CHANCE,
} from '../constants.js'

// Generate a canvas texture for building windows
function createWindowTexture(width, height) {
  const canvas = document.createElement('canvas')
  const cols = Math.max(2, Math.floor(width / 3))
  const rows = Math.max(3, Math.floor(height / 4))
  canvas.width = cols * 4
  canvas.height = rows * 4

  const ctx = canvas.getContext('2d')
  // Dark base
  ctx.fillStyle = PALETTE.building
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Windows
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (Math.random() < LIT_WINDOW_CHANCE) {
        const warmth = Math.random()
        if (warmth > 0.5) {
          ctx.fillStyle = `rgba(255, 230, 150, ${0.5 + Math.random() * 0.5})`
        } else {
          ctx.fillStyle = `rgba(200, 220, 255, ${0.4 + Math.random() * 0.4})`
        }
      } else {
        ctx.fillStyle = `rgba(20, 20, 40, ${0.8 + Math.random() * 0.2})`
      }
      ctx.fillRect(c * 4 + 1, r * 4 + 1, 2, 2)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.magFilter = THREE.NearestFilter
  texture.minFilter = THREE.NearestFilter
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

export function createBuilding(x, z, width, depth, height) {
  const geo = new THREE.BoxGeometry(width, height, depth)

  // Create window texture for each face
  const windowTex = createWindowTexture(width, height)
  const sideTex = createWindowTexture(depth, height)

  const materials = [
    new THREE.MeshBasicMaterial({ map: sideTex }),   // +x
    new THREE.MeshBasicMaterial({ map: sideTex }),   // -x
    new THREE.MeshBasicMaterial({ color: '#1a1a2a' }),  // +y (roof)
    new THREE.MeshBasicMaterial({ color: PALETTE.building }),  // -y (bottom)
    new THREE.MeshBasicMaterial({ map: windowTex }),  // +z
    new THREE.MeshBasicMaterial({ map: windowTex }),  // -z
  ]

  const mesh = new THREE.Mesh(geo, materials)
  mesh.position.set(x, height / 2, z)
  return mesh
}

export function createNeonSign(building, face) {
  const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)]
  const signWidth = 2 + Math.random() * 4
  const signHeight = 0.8 + Math.random() * 1.2

  const geo = new THREE.BoxGeometry(signWidth, signHeight, 0.2)
  const mat = new THREE.MeshBasicMaterial({ color })

  const sign = new THREE.Mesh(geo, mat)

  // Position on building face
  const bPos = building.position
  const bGeo = building.geometry.parameters
  const heightPos = bGeo.height * (0.3 + Math.random() * 0.5)
  const offset = 0.15

  switch (face) {
    case 'front':
      sign.position.set(bPos.x, heightPos, bPos.z + bGeo.depth / 2 + offset)
      break
    case 'back':
      sign.position.set(bPos.x, heightPos, bPos.z - bGeo.depth / 2 - offset)
      break
    case 'left':
      sign.position.set(bPos.x - bGeo.width / 2 - offset, heightPos, bPos.z)
      sign.rotation.y = Math.PI / 2
      break
    case 'right':
      sign.position.set(bPos.x + bGeo.width / 2 + offset, heightPos, bPos.z)
      sign.rotation.y = Math.PI / 2
      break
  }

  return sign
}

export function randomBuildingHeight() {
  return MIN_BUILDING_HEIGHT + Math.random() * (MAX_BUILDING_HEIGHT - MIN_BUILDING_HEIGHT)
}

export { NEON_SIGN_CHANCE }
