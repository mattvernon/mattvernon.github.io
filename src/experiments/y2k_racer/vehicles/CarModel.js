import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { CAR_WIDTH, CAR_LENGTH, CAR_HEIGHT, PALETTE } from '../constants.js'

const CAR_MODELS = {
  'skyline-r34': '/models/skyline-r34.glb',
}

// Simple placeholder box car (shown while GLB loads)
function createPlaceholderCar() {
  const group = new THREE.Group()

  const bodyGeo = new THREE.BoxGeometry(CAR_WIDTH, CAR_HEIGHT * 0.5, CAR_LENGTH)
  const bodyMat = new THREE.MeshBasicMaterial({ color: PALETTE.carBody })
  const body = new THREE.Mesh(bodyGeo, bodyMat)
  body.position.y = CAR_HEIGHT * 0.35
  group.add(body)

  const cabinGeo = new THREE.BoxGeometry(CAR_WIDTH * 0.85, CAR_HEIGHT * 0.4, CAR_LENGTH * 0.45)
  const cabinMat = new THREE.MeshBasicMaterial({ color: PALETTE.carAccent })
  const cabin = new THREE.Mesh(cabinGeo, cabinMat)
  cabin.position.y = CAR_HEIGHT * 0.7
  cabin.position.z = -CAR_LENGTH * 0.05
  group.add(cabin)

  const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 8)
  const wheelMat = new THREE.MeshBasicMaterial({ color: '#111111' })
  for (const [x, y, z] of [
    [-CAR_WIDTH / 2 - 0.1, 0.35, CAR_LENGTH * 0.3],
    [CAR_WIDTH / 2 + 0.1, 0.35, CAR_LENGTH * 0.3],
    [-CAR_WIDTH / 2 - 0.1, 0.35, -CAR_LENGTH * 0.3],
    [CAR_WIDTH / 2 + 0.1, 0.35, -CAR_LENGTH * 0.3],
  ]) {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat)
    wheel.position.set(x, y, z)
    wheel.rotation.z = Math.PI / 2
    group.add(wheel)
  }

  return group
}

export function createCarMesh() {
  return createPlaceholderCar()
}

export async function loadCarModel(carGroup, modelKey = 'skyline-r34') {
  const url = CAR_MODELS[modelKey]
  if (!url) return

  const loader = new GLTFLoader()
  try {
    const gltf = await loader.loadAsync(url)
    const model = gltf.scene

    // Measure the model's bounding box
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    // Scale uniformly to fit our car dimensions
    const scaleX = CAR_WIDTH / size.x
    const scaleZ = CAR_LENGTH / size.z
    const scale = Math.min(scaleX, scaleZ)
    model.scale.setScalar(scale)

    // Re-measure after scaling
    box.setFromObject(model)
    box.getCenter(center)
    box.getSize(size)

    // Position: bottom at y=0, centered on x/z
    model.position.set(-center.x, -box.min.y, -center.z)

    // Clear placeholder children
    while (carGroup.children.length > 0) {
      const child = carGroup.children[0]
      carGroup.remove(child)
      if (child.geometry) child.geometry.dispose()
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => m.dispose())
        else child.material.dispose()
      }
    }

    // Convert all materials to MeshBasicMaterial (scene has no lights, only bloom).
    // Darken colors so the car body sits below the bloom threshold (0.6) and
    // only the dedicated glow meshes (headlights, taillights, underglow) bloom.
    const BODY_DARKEN = 0.55
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        const newMats = mats.map((mat) => {
          const color = (mat.color || new THREE.Color(0xffffff)).clone().multiplyScalar(BODY_DARKEN)
          const basic = new THREE.MeshBasicMaterial({
            color,
            map: mat.map || null,
            transparent: mat.transparent,
            opacity: mat.opacity,
            side: mat.side,
          })
          mat.dispose()
          return basic
        })
        child.material = newMats.length === 1 ? newMats[0] : newMats
      }
    })

    carGroup.add(model)

    // Re-measure final bounds (model is now repositioned inside carGroup)
    const finalBox = new THREE.Box3().setFromObject(model)
    const finalSize = finalBox.getSize(new THREE.Vector3())

    // Add glow lights positioned to match actual model dimensions
    createCarLights(null, carGroup, {
      halfWidth: finalSize.x / 2,
      halfLength: finalSize.z / 2,
      height: finalSize.y,
    })
  } catch (err) {
    console.warn('Failed to load car model, keeping placeholder:', err)
  }
}

export function createCarLights(scene, carGroup, bounds = null) {
  // Use actual model bounds if available, otherwise fall back to constants
  const hw = bounds ? bounds.halfWidth : CAR_WIDTH / 2
  const hl = bounds ? bounds.halfLength : CAR_LENGTH / 2
  const h = bounds ? bounds.height : CAR_HEIGHT

  // Headlights — bright enough to trigger bloom for natural soft glow
  const glowGeo = new THREE.SphereGeometry(0.07, 8, 8)
  const glowMat = new THREE.MeshBasicMaterial({ color: PALETTE.headlight })
  for (const side of [-1, 1]) {
    const glow = new THREE.Mesh(glowGeo, glowMat)
    glow.position.set(hw * 0.55 * side, h * 0.35, hl)
    carGroup.add(glow)
  }

  // Headlight beam
  const beamGeo = new THREE.ConeGeometry(3, 15, 8, 1, true)
  const beamMat = new THREE.MeshBasicMaterial({
    color: PALETTE.headlight,
    transparent: true,
    opacity: 0.09,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const beam = new THREE.Mesh(beamGeo, beamMat)
  beam.rotation.x = Math.PI / 2
  beam.position.set(0, 0.3, hl + 7)
  carGroup.add(beam)

  // TODO: taillights — revisit later with better approach

  // Underglow
  const underglowGeo = new THREE.CircleGeometry(1.5, 12)
  const underglowMat = new THREE.MeshBasicMaterial({
    color: PALETTE.underglow,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const underglow = new THREE.Mesh(underglowGeo, underglowMat)
  underglow.rotation.x = -Math.PI / 2
  underglow.position.set(0, 0.05, 0)
  carGroup.add(underglow)

  return {}
}
