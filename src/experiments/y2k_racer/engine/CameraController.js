import * as THREE from 'three'
import {
  CAMERA_FOLLOW_DISTANCE,
  CAMERA_FOLLOW_HEIGHT,
  CAMERA_LOOK_AHEAD,
  CAMERA_SMOOTH_SPEED,
} from '../constants.js'

// Maximum allowed distance between camera and its target before snapping closer
const MAX_LAG_DISTANCE = 1.5

export default class CameraController {
  constructor(camera) {
    this.camera = camera
    this.targetPosition = new THREE.Vector3()
    this.lookTarget = new THREE.Vector3()
    this._tmpVec = new THREE.Vector3()
  }

  update(dt, car) {
    const carY = car.position.y

    // Target position: behind the car, elevated (follows car Y)
    this.targetPosition.set(
      car.position.x - car.forward.x * CAMERA_FOLLOW_DISTANCE,
      carY + CAMERA_FOLLOW_HEIGHT,
      car.position.z - car.forward.z * CAMERA_FOLLOW_DISTANCE
    )

    // Smooth follow
    const lerpFactor = 1 - Math.exp(-CAMERA_SMOOTH_SPEED * dt)
    this.camera.position.lerp(this.targetPosition, lerpFactor)

    // Clamp: don't let camera fall too far behind the target
    this._tmpVec.copy(this.camera.position).sub(this.targetPosition)
    const lag = this._tmpVec.length()
    if (lag > MAX_LAG_DISTANCE) {
      this._tmpVec.multiplyScalar(MAX_LAG_DISTANCE / lag)
      this.camera.position.copy(this.targetPosition).add(this._tmpVec)
    }

    // Look at point ahead of car (follows car Y)
    this.lookTarget.set(
      car.position.x + car.forward.x * CAMERA_LOOK_AHEAD,
      carY + 1.5,
      car.position.z + car.forward.z * CAMERA_LOOK_AHEAD
    )
    this.camera.lookAt(this.lookTarget)
  }

  setInitialPosition(car) {
    const carY = car.position.y
    this.camera.position.set(
      car.position.x - car.forward.x * CAMERA_FOLLOW_DISTANCE,
      carY + CAMERA_FOLLOW_HEIGHT,
      car.position.z - car.forward.z * CAMERA_FOLLOW_DISTANCE
    )
    this.lookTarget.set(
      car.position.x + car.forward.x * CAMERA_LOOK_AHEAD,
      carY + 1.5,
      car.position.z + car.forward.z * CAMERA_LOOK_AHEAD
    )
    this.camera.lookAt(this.lookTarget)
  }
}
