import * as THREE from 'three'
import { GRID_SIZE, BLOCK_SIZE, ROAD_WIDTH, SIDEWALK_WIDTH, PALETTE } from '../constants.js'

export function createRoads(scene) {
  const cellSize = BLOCK_SIZE + ROAD_WIDTH
  const totalSize = GRID_SIZE * cellSize
  const halfTotal = totalSize / 2

  const roads = new THREE.Group()

  const roadMat = new THREE.MeshBasicMaterial({ color: PALETTE.road })
  const sidewalkMat = new THREE.MeshBasicMaterial({ color: PALETTE.sidewalk })

  const lineMat = new THREE.MeshBasicMaterial({ color: PALETTE.roadLine })

  // Shared geometries (reuse across all roads)
  const hRoadGeo = new THREE.PlaneGeometry(totalSize, ROAD_WIDTH)
  const vRoadGeo = new THREE.PlaneGeometry(ROAD_WIDTH, totalSize)
  const hLineGeo = new THREE.PlaneGeometry(totalSize, 0.15)
  const vLineGeo = new THREE.PlaneGeometry(0.15, totalSize)
  const hDashGeo = new THREE.PlaneGeometry(3, 0.1)
  const vDashGeo = new THREE.PlaneGeometry(0.1, 3)
  const hSidewalkGeo = new THREE.BoxGeometry(totalSize, 0.15, SIDEWALK_WIDTH)
  const vSidewalkGeo = new THREE.BoxGeometry(SIDEWALK_WIDTH, 0.15, totalSize)

  const dashLength = 3
  const gapLength = 8 // wider gaps = fewer meshes

  // Horizontal roads (along X axis)
  for (let i = 0; i <= GRID_SIZE; i++) {
    const z = i * cellSize - halfTotal

    const road = new THREE.Mesh(hRoadGeo, roadMat)
    road.rotation.x = -Math.PI / 2
    road.position.set(0, 0.01, z)
    roads.add(road)

    const line = new THREE.Mesh(hLineGeo, lineMat)
    line.rotation.x = -Math.PI / 2
    line.position.set(0, 0.02, z)
    roads.add(line)

    // Dashed lane markings (only one lane line per side)
    for (let d = -halfTotal; d < halfTotal; d += dashLength + gapLength) {
      for (const offset of [-ROAD_WIDTH / 4, ROAD_WIDTH / 4]) {
        const dash = new THREE.Mesh(hDashGeo, lineMat)
        dash.rotation.x = -Math.PI / 2
        dash.position.set(d + dashLength / 2, 0.025, z + offset)
        roads.add(dash)
      }
    }

    for (const side of [-1, 1]) {
      const sw = new THREE.Mesh(hSidewalkGeo, sidewalkMat)
      sw.position.set(0, 0.075, z + side * (ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2))
      roads.add(sw)
    }
  }

  // Vertical roads (along Z axis)
  for (let i = 0; i <= GRID_SIZE; i++) {
    const x = i * cellSize - halfTotal

    const road = new THREE.Mesh(vRoadGeo, roadMat)
    road.rotation.x = -Math.PI / 2
    road.position.set(x, 0.01, 0)
    roads.add(road)

    const line = new THREE.Mesh(vLineGeo, lineMat)
    line.rotation.x = -Math.PI / 2
    line.position.set(x, 0.02, 0)
    roads.add(line)

    for (let d = -halfTotal; d < halfTotal; d += dashLength + gapLength) {
      for (const offset of [-ROAD_WIDTH / 4, ROAD_WIDTH / 4]) {
        const dash = new THREE.Mesh(vDashGeo, lineMat)
        dash.rotation.x = -Math.PI / 2
        dash.position.set(x + offset, 0.025, d + dashLength / 2)
        roads.add(dash)
      }
    }

    for (const side of [-1, 1]) {
      const sw = new THREE.Mesh(vSidewalkGeo, sidewalkMat)
      sw.position.set(x + side * (ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2), 0.075, 0)
      roads.add(sw)
    }
  }

  // Ground plane (beneath roads)
  const groundGeo = new THREE.PlaneGeometry(totalSize + 100, totalSize + 100)
  const groundMat = new THREE.MeshBasicMaterial({ color: PALETTE.ground })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = 0
  roads.add(ground)

  return roads
}
