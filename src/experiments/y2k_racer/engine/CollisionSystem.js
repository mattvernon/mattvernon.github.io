import { CAR_WIDTH, CAR_LENGTH, COLLISION_SPEED_FACTOR } from '../constants.js'

const HASH_CELL_SIZE = 50

export default class CollisionSystem {
  constructor() {
    this.staticBodies = [] // Array of { minX, minZ, maxX, maxZ }
    this.grid = new Map()  // spatial hash: "cx,cz" -> [body, ...]
  }

  addStaticBody(minX, minZ, maxX, maxZ, minY = -Infinity, maxY = Infinity) {
    const body = { minX, minZ, maxX, maxZ, minY, maxY }
    this.staticBodies.push(body)

    // Insert into spatial hash grid
    const cx0 = Math.floor(minX / HASH_CELL_SIZE)
    const cz0 = Math.floor(minZ / HASH_CELL_SIZE)
    const cx1 = Math.floor(maxX / HASH_CELL_SIZE)
    const cz1 = Math.floor(maxZ / HASH_CELL_SIZE)
    for (let cx = cx0; cx <= cx1; cx++) {
      for (let cz = cz0; cz <= cz1; cz++) {
        const key = `${cx},${cz}`
        if (!this.grid.has(key)) this.grid.set(key, [])
        this.grid.get(key).push(body)
      }
    }
  }

  clear() {
    this.staticBodies = []
    this.grid.clear()
  }

  resolve(car) {
    // Get car's oriented bounding box corners
    const corners = this._getCarCorners(car)
    const carAABB = this._cornersToAABB(corners)
    let collided = false

    // Query spatial hash for nearby bodies
    const nearby = this._queryNearby(car.position.x, car.position.z)

    const carY = car.position.y || 0

    for (const body of nearby) {
      // Y-range filter: skip bodies outside car's vertical range
      if (carY < body.minY - 1 || carY > body.maxY + 1) continue

      // Broad phase: AABB vs AABB
      if (!this._aabbOverlap(carAABB, body)) continue

      // Narrow phase: SAT test for OBB vs AABB
      const penetration = this._satTest(corners, car, body)
      if (penetration) {
        // Push car out
        car.position.x += penetration.x
        car.position.z += penetration.z
        // Reduce speed on collision
        car.speed *= COLLISION_SPEED_FACTOR
        collided = true
      }
    }

    return collided
  }

  _queryNearby(x, z) {
    const cx = Math.floor(x / HASH_CELL_SIZE)
    const cz = Math.floor(z / HASH_CELL_SIZE)
    const result = new Set()
    for (let dx = -1; dx <= 1; dx++) {
      for (let dz = -1; dz <= 1; dz++) {
        const key = `${cx + dx},${cz + dz}`
        const cell = this.grid.get(key)
        if (cell) for (const b of cell) result.add(b)
      }
    }
    return result
  }

  _getCarCorners(car) {
    const hw = CAR_WIDTH / 2
    const hl = CAR_LENGTH / 2
    const cos = Math.cos(car.heading)
    const sin = Math.sin(car.heading)
    const cx = car.position.x
    const cz = car.position.z

    return [
      { x: cx + sin * hl - cos * hw, z: cz + cos * hl + sin * hw },
      { x: cx + sin * hl + cos * hw, z: cz + cos * hl - sin * hw },
      { x: cx - sin * hl + cos * hw, z: cz - cos * hl - sin * hw },
      { x: cx - sin * hl - cos * hw, z: cz - cos * hl + sin * hw },
    ]
  }

  _cornersToAABB(corners) {
    let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity
    for (const c of corners) {
      if (c.x < minX) minX = c.x
      if (c.z < minZ) minZ = c.z
      if (c.x > maxX) maxX = c.x
      if (c.z > maxZ) maxZ = c.z
    }
    return { minX, minZ, maxX, maxZ }
  }

  _aabbOverlap(a, b) {
    return a.minX < b.maxX && a.maxX > b.minX && a.minZ < b.maxZ && a.maxZ > b.minZ
  }

  _satTest(corners, car, body) {
    // Get axes to test: 2 from car orientation, 2 from AABB (world axes)
    const sin = Math.sin(car.heading)
    const cos = Math.cos(car.heading)
    const axes = [
      { x: sin, z: cos },       // car forward
      { x: cos, z: -sin },      // car right
      { x: 1, z: 0 },           // world X
      { x: 0, z: 1 },           // world Z
    ]

    const bodyCorners = [
      { x: body.minX, z: body.minZ },
      { x: body.maxX, z: body.minZ },
      { x: body.maxX, z: body.maxZ },
      { x: body.minX, z: body.maxZ },
    ]

    let minOverlap = Infinity
    let minAxis = null

    for (const axis of axes) {
      const carProj = this._projectCorners(corners, axis)
      const bodyProj = this._projectCorners(bodyCorners, axis)

      const overlap = Math.min(carProj.max - bodyProj.min, bodyProj.max - carProj.min)
      if (overlap <= 0) return null // Separating axis found, no collision

      if (overlap < minOverlap) {
        minOverlap = overlap
        // Push direction: from body center to car center
        const carCenter = { x: car.position.x, z: car.position.z }
        const bodyCenter = { x: (body.minX + body.maxX) / 2, z: (body.minZ + body.maxZ) / 2 }
        const dx = carCenter.x - bodyCenter.x
        const dz = carCenter.z - bodyCenter.z
        const dot = dx * axis.x + dz * axis.z
        const sign = dot >= 0 ? 1 : -1
        minAxis = { x: axis.x * sign * minOverlap, z: axis.z * sign * minOverlap }
      }
    }

    return minAxis
  }

  _projectCorners(corners, axis) {
    let min = Infinity, max = -Infinity
    for (const c of corners) {
      const proj = c.x * axis.x + c.z * axis.z
      if (proj < min) min = proj
      if (proj > max) max = proj
    }
    return { min, max }
  }
}
