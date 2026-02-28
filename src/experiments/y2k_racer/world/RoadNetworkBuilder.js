import * as THREE from 'three'
import { PALETTE, SIDEWALK_WIDTH } from '../constants.js'
import InstanceManager from './InstanceManager.js'

const roadMat = new THREE.MeshBasicMaterial({ color: PALETTE.road })
const sidewalkMat = new THREE.MeshBasicMaterial({ color: PALETTE.sidewalk })
const lineMat = new THREE.MeshBasicMaterial({ color: PALETTE.roadLine })

const DASH_LENGTH = 3
const DASH_GAP = 25

export function buildRoadNetwork(streets) {
  const group = new THREE.Group()

  // Instanced dash geometry (pre-rotated to lay flat)
  const dashGeo = new THREE.PlaneGeometry(0.1, DASH_LENGTH)
  dashGeo.rotateX(-Math.PI / 2) // bake flat rotation into vertices

  const instances = new InstanceManager()
  instances.register('dash', dashGeo, lineMat)

  for (const seg of streets) {
    // Bridge roads are rendered by BridgeBuilder with elevation
    if (seg.type === 'bridge') continue

    const dx = seg.end.x - seg.start.x
    const dz = seg.end.z - seg.start.z
    const length = Math.sqrt(dx * dx + dz * dz)
    if (length < 1) continue
    const angle = Math.atan2(dx, dz)
    const midX = (seg.start.x + seg.end.x) / 2
    const midZ = (seg.start.z + seg.end.z) / 2
    const dirX = dx / length
    const dirZ = dz / length

    // Road surface
    const roadGeo = new THREE.PlaneGeometry(seg.width, length)
    const road = new THREE.Mesh(roadGeo, roadMat)
    road.rotation.x = -Math.PI / 2
    road.rotation.z = -angle
    road.position.set(midX, 0.01, midZ)
    group.add(road)

    // Center line
    const lineGeo = new THREE.PlaneGeometry(0.15, length)
    const line = new THREE.Mesh(lineGeo, lineMat)
    line.rotation.x = -Math.PI / 2
    line.rotation.z = -angle
    line.position.set(midX, 0.02, midZ)
    group.add(line)

    // Lane dashes — collect as instances
    for (const laneOffset of [-seg.width / 4, seg.width / 4]) {
      const offX = (-dz / length) * laneOffset
      const offZ = (dx / length) * laneOffset
      const dashStep = DASH_LENGTH + DASH_GAP
      const numDashes = Math.floor(length / dashStep)

      for (let d = 0; d < numDashes; d++) {
        const t = (d * dashStep + DASH_LENGTH / 2) / length - 0.5
        const dashX = midX + dirX * t * length + offX
        const dashZ = midZ + dirZ * t * length + offZ
        instances.add('dash', dashX, 0.025, dashZ, angle)
      }
    }

    // Sidewalks on both sides
    const swGeo = new THREE.BoxGeometry(SIDEWALK_WIDTH, 0.15, length)
    const swOffset = seg.width / 2 + SIDEWALK_WIDTH / 2
    const perpNX = -dz / length
    const perpNZ = dx / length

    for (const side of [-1, 1]) {
      const sw = new THREE.Mesh(swGeo, sidewalkMat)
      sw.rotation.y = angle
      sw.position.set(
        midX + perpNX * swOffset * side,
        0.075,
        midZ + perpNZ * swOffset * side
      )
      group.add(sw)
    }
  }

  // Build instanced dashes
  instances.build(group)

  // Ground plane is created by MapGenerator (with water zone cutout)

  return group
}
