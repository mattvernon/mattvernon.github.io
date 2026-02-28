import * as THREE from 'three'
import InputManager from './InputManager.js'
import CarPhysics from './CarPhysics.js'
import CameraController from './CameraController.js'
import CollisionSystem from './CollisionSystem.js'
import MapGenerator from '../world/MapGenerator.js'
import ElevationSystem from '../world/ElevationSystem.js'
import { createCarMesh, createCarLights, loadCarModel } from '../vehicles/CarModel.js'
import PostProcessingPipeline from '../effects/PostProcessingPipeline.js'
import AudioManager from './AudioManager.js'
import { CAMERA_FOV, FIXED_TIMESTEP } from '../constants.js'

function disposeObject(obj) {
  if (obj.geometry) obj.geometry.dispose()
  if (obj.material) {
    if (Array.isArray(obj.material)) {
      obj.material.forEach(m => {
        if (m.map) m.map.dispose()
        m.dispose()
      })
    } else {
      if (obj.material.map) obj.material.map.dispose()
      obj.material.dispose()
    }
  }
}

export default class GameEngine {
  constructor(canvas, { onHudUpdate, onReady } = {}) {
    this.canvas = canvas
    this.onHudUpdate = onHudUpdate
    this.onReady = onReady
    this.running = false
    this.animFrameId = null
    this.clock = new THREE.Clock(false)
    this.accumulator = 0
    this.elapsedTime = 0
    this.mapRoot = null
    this.currentMapConfig = null
  }

  init(mapConfig) {
    const width = this.canvas.clientWidth
    const height = this.canvas.clientHeight

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      powerPreference: 'high-performance',
    })
    this.renderer.setSize(width, height, false)
    this.renderer.setPixelRatio(1)
    this.renderer.shadowMap.enabled = false
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.0

    // Scene
    this.scene = new THREE.Scene()

    // Camera
    this.camera = new THREE.PerspectiveCamera(CAMERA_FOV, width / height, 0.5, 500)

    // Input
    this.input = new InputManager(window)

    // Physics — start car at map spawn point
    this.carPhysics = new CarPhysics()
    const spawn = mapConfig.spawnPoint
    this.carPhysics.reset(spawn.x, spawn.z, spawn.heading)

    // Car mesh
    this.carMesh = createCarMesh()
    this.scene.add(this.carMesh)
    this.carLights = createCarLights(this.scene, this.carMesh)

    loadCarModel(this.carMesh)

    // Camera controller
    this.cameraController = new CameraController(this.camera)
    this.cameraController.setInitialPosition(this.carPhysics)

    // Collision system
    this.collision = new CollisionSystem()

    // Build map
    this.currentMapConfig = mapConfig
    this.elevationSystem = new ElevationSystem(mapConfig)
    this.mapGenerator = new MapGenerator(this.scene, this.collision, this.elevationSystem, mapConfig)
    this.mapRoot = this.mapGenerator.build()

    // Post-processing
    this.postProcessing = new PostProcessingPipeline(this.renderer, this.scene, this.camera)

    // Audio
    this.audio = new AudioManager()
    this.audio.init()

    // Resize handler
    this._onResize = this._handleResize.bind(this)
    window.addEventListener('resize', this._onResize)

    if (this.onReady) this.onReady()
  }

  swapMap(mapConfig) {
    // Dispose old map
    if (this.mapRoot) {
      this.scene.remove(this.mapRoot)
      this.mapRoot.traverse((obj) => {
        disposeObject(obj)
      })
      this.mapRoot = null
    }

    // Clear collision
    this.collision.clear()

    // Rebuild with new config
    this.currentMapConfig = mapConfig
    this.elevationSystem = new ElevationSystem(mapConfig)
    this.mapGenerator = new MapGenerator(this.scene, this.collision, this.elevationSystem, mapConfig)
    this.mapRoot = this.mapGenerator.build()

    // Reset car to new spawn
    const spawn = mapConfig.spawnPoint
    this.carPhysics.reset(spawn.x, spawn.z, spawn.heading)
    this.cameraController.setInitialPosition(this.carPhysics)
  }

  swapCarModel(modelKey) {
    // Dispose current car mesh children
    while (this.carMesh.children.length > 0) {
      const child = this.carMesh.children[0]
      this.carMesh.remove(child)
      if (child.geometry) child.geometry.dispose()
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach(m => {
          if (m.map) m.map.dispose()
          m.dispose()
        })
        else {
          if (child.material.map) child.material.map.dispose()
          child.material.dispose()
        }
      }
      child.traverse?.((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => {
            if (m.map) m.map.dispose()
            m.dispose()
          })
          else {
            if (obj.material.map) obj.material.map.dispose()
            obj.material.dispose()
          }
        }
      })
    }

    // Re-add placeholder then load new model
    const placeholder = createCarMesh()
    for (const child of [...placeholder.children]) {
      this.carMesh.add(child)
    }
    createCarLights(this.scene, this.carMesh)
    loadCarModel(this.carMesh, modelKey)

    // Reset car to map spawn position
    const spawn = this.currentMapConfig.spawnPoint
    this.carPhysics.reset(spawn.x, spawn.z, spawn.heading)
    this.cameraController.setInitialPosition(this.carPhysics)
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
    this.audio.setPlaying(false)
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId)
      this.animFrameId = null
    }
  }

  resume() {
    if (this.running) return
    this.running = true
    this.clock.start()
    this.audio.setPlaying(true)
    this.audio.startMusic()
    this._loop()
  }

  _loop() {
    if (!this.running) return
    this.animFrameId = requestAnimationFrame(() => this._loop())

    const rawDelta = this.clock.getDelta()
    const delta = Math.min(rawDelta, 0.1)
    this.elapsedTime += delta

    this.accumulator += delta
    while (this.accumulator >= FIXED_TIMESTEP) {
      this._fixedUpdate(FIXED_TIMESTEP)
      this.accumulator -= FIXED_TIMESTEP
    }

    this._visualUpdate(delta)

    this.postProcessing.update(this.elapsedTime)
    this.postProcessing.render()
  }

  _fixedUpdate(dt) {
    const inputState = this.input.getState()
    this.carPhysics.update(dt, inputState, this.elevationSystem)
    const collided = this.collision.resolve(this.carPhysics)

    this.audio.update(this.carPhysics.speed, inputState, collided)
  }

  _visualUpdate(dt) {
    this.carMesh.position.copy(this.carPhysics.position)
    this.carMesh.rotation.y = this.carPhysics.heading
    this.carMesh.rotation.x = -(this.carPhysics.slopeAngle || 0)

    this.cameraController.update(dt, this.carPhysics)

    if (this.onHudUpdate) {
      this.onHudUpdate(
        this.carPhysics.getSpeedKMH(),
        this.carPhysics.position.x,
        this.carPhysics.position.z,
        this.carPhysics.heading
      )
    }
  }

  _handleResize() {
    const width = this.canvas.clientWidth
    const height = this.canvas.clientHeight
    if (width === 0 || height === 0) return

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height, false)
    this.postProcessing.resize(width, height)
  }

  dispose() {
    this.pause()
    this.audio.dispose()
    window.removeEventListener('resize', this._onResize)
    this.input.dispose()

    this.scene.traverse((obj) => {
      disposeObject(obj)
    })

    this.postProcessing.dispose()
    this.renderer.dispose()
  }
}
