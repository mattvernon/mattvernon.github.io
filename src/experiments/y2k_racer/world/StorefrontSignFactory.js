import * as THREE from 'three'

// Eagerly import all sign image URLs via Vite glob
const signModules = import.meta.glob('/src/experiments/y2k_racer/assets/signs/*.png', {
  eager: true,
  import: 'default',
})
const SIGN_URLS = Object.values(signModules)

// Pre-load images at module init so they're ready by the time map generates
// (user goes through title → car select → map select before map build)
const signImages = SIGN_URLS.map((url) => {
  const img = new Image()
  img.src = url
  return img
})

// Cached Three.js textures built from pre-loaded images
let loadedSigns = null

function loadSignTextures() {
  if (loadedSigns) return loadedSigns

  loadedSigns = signImages.map((img) => {
    const texture = new THREE.Texture(img)
    texture.magFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestFilter
    texture.colorSpace = THREE.SRGBColorSpace

    if (img.complete) {
      texture.needsUpdate = true
    } else {
      img.onload = () => { texture.needsUpdate = true }
    }

    const aspectRatio = (img.complete && img.naturalWidth && img.naturalHeight)
      ? img.naturalWidth / img.naturalHeight
      : 3

    return { texture, aspectRatio }
  })

  return loadedSigns
}

const MAX_SIGN_WIDTH = 8
const MIN_SIGN_WIDTH = 3
const SIGN_BASE_HEIGHT = 3.5 // center Y position — street-level storefront height

export function createStorefrontSign(building, face) {
  const signs = loadSignTextures()
  if (signs.length === 0) return null

  const entry = signs[Math.floor(Math.random() * signs.length)]

  const bPos = building.position
  const bGeo = building.geometry.parameters
  const faceWidth = (face === 'left' || face === 'right') ? bGeo.depth : bGeo.width

  // Size sign to 60-80% of the building face, capped
  const signWidth = Math.min(MAX_SIGN_WIDTH, Math.max(MIN_SIGN_WIDTH, faceWidth * (0.6 + Math.random() * 0.2)))
  const signHeight = signWidth / entry.aspectRatio

  const geo = new THREE.PlaneGeometry(signWidth, signHeight)
  const mat = new THREE.MeshBasicMaterial({
    map: entry.texture,
    transparent: true,
  })

  const sign = new THREE.Mesh(geo, mat)

  const heightPos = SIGN_BASE_HEIGHT + (Math.random() - 0.5) * 1
  const offset = 0.15

  switch (face) {
    case 'front':
      sign.position.set(bPos.x, heightPos, bPos.z + bGeo.depth / 2 + offset)
      break
    case 'back':
      sign.position.set(bPos.x, heightPos, bPos.z - bGeo.depth / 2 - offset)
      sign.rotation.y = Math.PI
      break
    case 'left':
      sign.position.set(bPos.x - bGeo.width / 2 - offset, heightPos, bPos.z)
      sign.rotation.y = -Math.PI / 2
      break
    case 'right':
      sign.position.set(bPos.x + bGeo.width / 2 + offset, heightPos, bPos.z)
      sign.rotation.y = Math.PI / 2
      break
  }

  return sign
}
