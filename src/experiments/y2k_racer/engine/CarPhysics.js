import * as THREE from 'three'
import {
  MAX_SPEED,
  ACCELERATION,
  BRAKING,
  FRICTION,
  TURN_SPEED,
  TURN_SPEED_FACTOR,
  SLOPE_GRAVITY,
} from '../constants.js'

export default class CarPhysics {
  constructor() {
    this.position = new THREE.Vector3(0, 0, 0)
    this.heading = 0 // radians
    this.speed = 0
    this.forward = new THREE.Vector3(0, 0, 1)
  }

  reset(x = 0, z = 0, heading = 0) {
    this.position.set(x, 0, z)
    this.heading = heading
    this.speed = 0
    this._updateForward()
  }

  update(dt, input, elevationSystem) {
    // Acceleration / braking
    if (input.forward) {
      this.speed += ACCELERATION * dt
    }
    if (input.backward) {
      if (this.speed > 0) {
        this.speed -= BRAKING * dt
      } else {
        this.speed -= ACCELERATION * 0.5 * dt // reverse
      }
    }

    // Handbrake
    if (input.brake) {
      this.speed *= 0.95
    }

    // Friction
    this.speed *= FRICTION

    // Slope gravity effect (uphill slows, downhill accelerates)
    if (elevationSystem) {
      const slopeAngle = elevationSystem.getSlopeAngle(
        this.position.x, this.position.z, this.heading
      )
      this.speed -= Math.sin(slopeAngle) * SLOPE_GRAVITY * dt
      this.slopeAngle = slopeAngle
    }

    // Clamp speed
    this.speed = THREE.MathUtils.clamp(this.speed, -MAX_SPEED * 0.3, MAX_SPEED)

    // Stop drift at very low speeds
    if (Math.abs(this.speed) < 0.1) {
      this.speed = 0
    }

    // Steering (speed-dependent)
    const speedRatio = Math.abs(this.speed) / MAX_SPEED
    const turnRate = TURN_SPEED * (1 - speedRatio * TURN_SPEED_FACTOR)

    if (Math.abs(this.speed) > 0.5) {
      const turnDirection = this.speed > 0 ? 1 : -1
      if (input.left) {
        this.heading += turnRate * dt * turnDirection
      }
      if (input.right) {
        this.heading -= turnRate * dt * turnDirection
      }
    }

    // Update forward vector
    this._updateForward()

    // Move
    this.position.x += this.forward.x * this.speed * dt
    this.position.z += this.forward.z * this.speed * dt

    // Update Y position from elevation
    if (elevationSystem) {
      this.position.y = elevationSystem.getElevation(this.position.x, this.position.z)
    }
  }

  _updateForward() {
    this.forward.set(Math.sin(this.heading), 0, Math.cos(this.heading))
  }

  getSpeedKMH() {
    return Math.abs(Math.round(this.speed * 3.6))
  }
}
