import * as THREE from 'three'

// Lightweight helper for batching repeated geometry into InstancedMesh calls.
// Register geometry+material pairs, collect transforms, then build() to create meshes.

const _matrix = new THREE.Matrix4()
const _pos = new THREE.Vector3()
const _quat = new THREE.Quaternion()
const _scale = new THREE.Vector3(1, 1, 1)
const _euler = new THREE.Euler()

export default class InstanceManager {
  constructor() {
    this.batches = new Map() // name -> { geometry, material, transforms: [] }
  }

  register(name, geometry, material) {
    this.batches.set(name, { geometry, material, transforms: [] })
  }

  // Add instance at position with optional Y rotation
  add(name, x, y, z, rotY = 0) {
    _pos.set(x, y, z)
    if (rotY !== 0) {
      _euler.set(0, rotY, 0)
      _quat.setFromEuler(_euler)
    } else {
      _quat.identity()
    }
    _scale.set(1, 1, 1)
    _matrix.compose(_pos, _quat, _scale)
    this.batches.get(name).transforms.push(_matrix.clone())
  }

  // Add instance with full euler rotation
  addRotated(name, x, y, z, rx, ry, rz) {
    _pos.set(x, y, z)
    _euler.set(rx, ry, rz)
    _quat.setFromEuler(_euler)
    _scale.set(1, 1, 1)
    _matrix.compose(_pos, _quat, _scale)
    this.batches.get(name).transforms.push(_matrix.clone())
  }

  // Create all InstancedMesh objects and add to parent
  build(parent) {
    for (const [, batch] of this.batches) {
      const count = batch.transforms.length
      if (count === 0) continue
      const mesh = new THREE.InstancedMesh(batch.geometry, batch.material, count)
      for (let i = 0; i < count; i++) {
        mesh.setMatrixAt(i, batch.transforms[i])
      }
      mesh.instanceMatrix.needsUpdate = true
      parent.add(mesh)
    }
  }
}
