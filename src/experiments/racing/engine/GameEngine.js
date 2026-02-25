import * as THREE from 'three'
import InputManager from './InputManager.js'
import CarPhysics from './CarPhysics.js'
import CameraController from './CameraController.js'
import CollisionSystem from './CollisionSystem.js'
import CityBuilder from '../world/CityBuilder.js'
import { createCarMesh, createCarLights, loadCarModel } from '../vehicles/CarModel.js'
import PostProcessingPipeline from '../effects/PostProcessingPipeline.js'
import { CAMERA_FOV, FIXED_TIMESTEP, GRID_SIZE, BLOCK_SIZE, ROAD_WIDTH } from '../constants.js'

export default class GameEngine {
  constructor(canvas, { onSpeedUpdate, onReady } = {}) {
    this.canvas = canvas
    this.onSpeedUpdate = onSpeedUpdate
    this.onReady = onReady
    this.running = false
    this.animFrameId = null
    this.clock = new THREE.Clock(false)
    this.accumulator = 0
    this.elapsedTime = 0
  }

  init() {
    const width = this.canvas.clientWidth
    const height = this.canvas.clientHeight

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false, // we pixelate anyway
      powerPreference: 'high-performance',
    })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(1) // keep it lo-fi
    this.renderer.shadowMap.enabled = false
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0

    // Scene
    this.scene = new THREE.Scene()

    // Camera
    this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, width / height, 0.5, 300)

    // Input
    this.input = new InputManager(window)

    // Physics
    this.carPhysics = new CarPhysics()
    // Start car on a road in the center of the grid
    const cellSize = BLOCK_SIZE + ROAD_WIDTH
    const startX = 0
    const startZ = -cellSize / 2
    this.carPhysics.reset(startX, startZ, 0)

    // Car mesh (placeholder shown immediately, GLB loaded async)
    this.carMesh = createCarMesh()
    this.scene.add(this.carMesh)
    this.carLights = createCarLights(this.scene, this.carMesh)

    // Load the real 3D model in the background (swaps out placeholder when ready)
    loadCarModel(this.carMesh)

    // Camera controller
    this.cameraController = new CameraController(this.camera)
    this.cameraController.setInitialPosition(this.carPhysics)

    // Collision system
    this.collision = new CollisionSystem()

    // Build city
    this.cityBuilder = new CityBuilder(this.scene, this.collision)
    this.cityBuilder.build()

    // Post-processing
    this.postProcessing = new PostProcessingPipeline(this.renderer, this.scene, this.camera)

    // Resize handler
    this._onResize = this._handleResize.bind(this)
    window.addEventListener('resize', this._onResize)

    if (this.onReady) this.onReady()
  }

  start() {
    if (this.running) return
    this.running = true
    this.clock.start()
    this._loop()
  }

  pause() {
    this.running = false
    this.clock.stop()
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = null
    }
  }

  resume() {
    if (this.running) return
    this.running = true
    this.clock.start()
    this._loop()
  }

  _loop() {
    if (!this.running) return
    this.animFrameId = requestAnimationFrame(() => this._loop())

    const rawDelta = this.clock.getDelta()
    // Clamp to prevent spiral of death on tab switch
    const delta = Math.min(rawDelta, 0.1)
    this.elapsedTime += delta

    // Fixed timestep physics
    this.accumulator += delta
    while (this.accumulator >= FIXED_TIMESTEP) {
      this._fixedUpdate(FIXED_TIMESTEP)
      this.accumulator -= FIXED_TIMESTEP
    }

    // Visual update (smooth)
    this._visualUpdate(delta)

    // Render
    this.postProcessing.update(this.elapsedTime)
    this.postProcessing.render()
  }

  _fixedUpdate(dt) {
    const inputState = this.input.getState()
    this.carPhysics.update(dt, inputState)
    this.collision.resolve(this.carPhysics)
  }

  _visualUpdate(dt) {
    // Update car mesh to match physics
    this.carMesh.position.copy(this.carPhysics.position)
    this.carMesh.rotation.y = this.carPhysics.heading

    // Camera follow
    this.cameraController.update(dt, this.carPhysics)

    // Report speed to UI
    if (this.onSpeedUpdate) {
      this.onSpeedUpdate(this.carPhysics.getSpeedKMH())
    }
  }

  _handleResize() {
    const width = this.canvas.clientWidth
    const height = this.canvas.clientHeight
    if (width === 0 || height === 0) return

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
    this.postProcessing.resize(width, height)
  }

  dispose() {
    this.pause()
    window.removeEventListener('resize', this._onResize)
    this.input.dispose()

    // Dispose Three.js resources
    this.scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose()
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => {
            if (m.map) m.map.dispose()
            m.dispose()
          })
        } else {
          if (obj.material.map) obj.material.map.dispose()
          obj.material.dispose()
        }
      }
    })

    this.postProcessing.dispose()
    this.renderer.dispose()
  }
}
