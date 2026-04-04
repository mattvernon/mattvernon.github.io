import * as THREE from 'three'

const DEFAULT_SETTINGS = {
  // Spiral shape
  spiralTightness: 0.22,    // How tight the spiral winds (higher = tighter)
  imageSpacing: 1.2,         // Distance between images along the spiral path
  maxTurns: 4,               // Number of spiral turns
  spiralRotation: 0,         // Overall rotation offset of the spiral (degrees)

  // Images
  baseSize: 1.4,             // Base size of image cards
  sizeGrowth: 0.1,           // How much images grow toward the outside
  aspectRatio: 1.3,          // Width/height ratio of cards
  borderRadius: 0.14,        // Corner rounding (0-0.5)

  // Rotation
  imageRotation: 'tangent',  // 'tangent', 'fixed', 'random'
  rotationOffset: 0,         // Additional rotation per image (degrees)

  // Animation
  animationSpeed: 0.15,      // Speed of the whirlpool animation
  animationEnabled: true,

  // Fading
  centerFade: 0.18,          // Distance from center where images start fading
  edgeFade: 0.92,            // Normalized position where edge fading begins (higher = less fade)
  centerFadeSharpness: 2,    // How sharp the center fade is
  edgeFadeSharpness: 2,      // How sharp the edge fade is

  // Visual
  backgroundColor: '#f5f0eb',
  imageScale3D: 0.02,        // Slight 3D tilt amount

  // Density
  density: 75,               // Total number of images to show

  // Camera
  zoom: 30,                   // Camera zoom (frustum size — lower = more zoomed in)
}

export default class SpiralEngine {
  constructor(canvas, imageUrls) {
    this.canvas = canvas
    this.imageUrls = imageUrls
    this.settings = { ...DEFAULT_SETTINGS }
    this.textures = []
    this.imagePlanes = []
    this.animationOffset = 0
    this.disposed = false
    this.texturesLoaded = 0
    this.onProgress = null

    this.init()
  }

  init() {
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight

    // Disable color management so shader colors match scene background exactly
    THREE.ColorManagement.enabled = false

    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(this.settings.backgroundColor)

    // Use orthographic camera for 2D-style layout
    const aspect = w / h
    this.frustumSize = this.settings.zoom
    this.camera = new THREE.OrthographicCamera(
      -this.frustumSize * aspect / 2,
      this.frustumSize * aspect / 2,
      this.frustumSize / 2,
      -this.frustumSize / 2,
      0.1,
      100
    )
    this.camera.position.z = 50

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
    })
    this.renderer.setSize(w, h)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    this.loadTextures()
    this.buildSpiral()
    this.animate()

    this._onResize = () => this.resize()
    window.addEventListener('resize', this._onResize)
  }

  loadTextures() {
    const loader = new THREE.TextureLoader()
    this.shuffledUrls = [...this.imageUrls].sort(() => Math.random() - 0.5)
    this.loadedTextures = [] // dense array of successfully loaded textures
    this._pendingRebuild = false

    // Load in batches to avoid overwhelming the browser
    const batchSize = 20
    let batchIndex = 0

    const loadBatch = () => {
      if (this.disposed) return
      const start = batchIndex * batchSize
      const end = Math.min(start + batchSize, this.shuffledUrls.length)

      for (let i = start; i < end; i++) {
        loader.load(
          this.shuffledUrls[i],
          (texture) => {
            if (this.disposed) return
            texture.minFilter = THREE.LinearMipmapLinearFilter
            texture.magFilter = THREE.LinearFilter
            this.loadedTextures.push(texture)
            this.texturesLoaded = this.loadedTextures.length

            if (this.onProgress) {
              this.onProgress(this.texturesLoaded, this.shuffledUrls.length)
            }

            // Assign texture to a plane that needs one
            this.assignTexturesToPlanes()

            // Rebuild once after first batch loads
            if (this.texturesLoaded === Math.min(batchSize, this.shuffledUrls.length)) {
              this.buildSpiral()
            }
          },
          undefined,
          () => {
            // On error, skip
          }
        )
      }

      batchIndex++
      if (end < this.shuffledUrls.length) {
        setTimeout(loadBatch, 100)
      }
    }

    loadBatch()
  }

  assignTexturesToPlanes() {
    if (this.loadedTextures.length === 0) return
    this.imagePlanes.forEach((mesh, i) => {
      const tex = this.loadedTextures[i % this.loadedTextures.length]
      if (tex && mesh.material.uniforms.map.value !== tex) {
        mesh.material.uniforms.map.value = tex
        mesh.material.needsUpdate = true
      }
    })
  }

  // Parse hex color to raw 0-1 sRGB values (bypasses THREE.Color linear conversion)
  parseHexToRGB(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    return [r, g, b]
  }

  createFadeMaterial(texture) {
    const [r, g, b] = this.parseHexToRGB(this.settings.backgroundColor)
    return new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texture },
        bgColor: { value: new THREE.Vector3(r, g, b) },
        fadeAmount: { value: 0.0 }, // 0 = fully visible, 1 = fully faded to bg
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform vec3 bgColor;
        uniform float fadeAmount;
        varying vec2 vUv;

        // sRGB decode (matches what Three.js does for sRGB textures)
        vec3 sRGBToLinear(vec3 c) {
          return pow(c, vec3(2.2));
        }
        vec3 linearToSRGB(vec3 c) {
          return pow(c, vec3(1.0 / 2.2));
        }

        void main() {
          vec4 texColor = texture2D(map, vUv);
          // Mix in sRGB space for perceptually correct blending
          vec3 finalColor = mix(texColor.rgb, bgColor, fadeAmount);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      side: THREE.DoubleSide,
    })
  }

  createRoundedRectShape(w, h, r) {
    const shape = new THREE.Shape()
    const x = -w / 2
    const y = -h / 2
    r = Math.min(r, w / 2, h / 2)

    shape.moveTo(x + r, y)
    shape.lineTo(x + w - r, y)
    shape.quadraticCurveTo(x + w, y, x + w, y + r)
    shape.lineTo(x + w, y + h - r)
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    shape.lineTo(x + r, y + h)
    shape.quadraticCurveTo(x, y + h, x, y + h - r)
    shape.lineTo(x, y + r)
    shape.quadraticCurveTo(x, y, x + r, y)

    return shape
  }

  buildSpiral() {
    // Clear existing
    this.imagePlanes.forEach(p => {
      this.scene.remove(p)
      p.geometry.dispose()
      p.material.dispose()
    })
    this.imagePlanes = []

    const {
      spiralTightness, imageSpacing, maxTurns, spiralRotation,
      baseSize, sizeGrowth, aspectRatio, borderRadius,
      imageRotation, rotationOffset,
      density
    } = this.settings

    // Generate spiral positions using Archimedean spiral: r = a + b*theta
    const positions = []
    const a = 0.3 // starting radius
    const b = spiralTightness * 10 // growth per radian

    let theta = 0
    const maxTheta = maxTurns * Math.PI * 2
    const step = imageSpacing

    while (theta < maxTheta && positions.length < density) {
      const r = a + b * theta
      const globalRot = (spiralRotation * Math.PI) / 180
      const x = r * Math.cos(theta + globalRot)
      const y = r * Math.sin(theta + globalRot)

      // Calculate tangent angle
      const tangentAngle = theta + globalRot + Math.PI / 2

      positions.push({ x, y, r, theta, tangentAngle })

      // Step along the spiral arc length, with minimum angular step
      // to prevent bunching in the inner spiral
      const arcStep = Math.max(step / Math.max(r, 1.0), 0.25)
      theta += arcStep
    }

    // Compute max radius for fade calculations and camera fitting
    const maxR = positions.length > 0 ? positions[positions.length - 1].r : 1

    // Use zoom setting for camera frustum
    this.frustumSize = this.settings.zoom
    this.updateCamera()

    // Seeded random for consistent rotation
    const seededRandom = (i) => {
      const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
      return x - Math.floor(x)
    }

    positions.forEach((pos, i) => {
      const t = pos.r / maxR // normalized position (0 = center, 1 = edge)
      const size = baseSize + sizeGrowth * t * 10
      const w = size * aspectRatio
      const h = size
      const cornerR = borderRadius * Math.min(w, h)

      // Create rounded rect geometry
      const shape = this.createRoundedRectShape(w, h, cornerR)
      const geometry = new THREE.ShapeGeometry(shape, 8)

      // Compute UVs for the rounded shape
      const posAttr = geometry.attributes.position
      for (let j = 0; j < posAttr.count; j++) {
        const px = posAttr.getX(j)
        const py = posAttr.getY(j)
        // Map from shape coords to 0-1 UV
        const u = (px + w / 2) / w
        const v = (py + h / 2) / h
        geometry.attributes.uv.setXY(j, u, v)
      }

      const textureIndex = this.loadedTextures.length > 0 ? i % this.loadedTextures.length : -1
      const texture = textureIndex >= 0 ? this.loadedTextures[textureIndex] : null

      const material = this.createFadeMaterial(texture)

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(pos.x, pos.y, i * 0.001) // slight z offset for layering

      // Rotation
      let angle = 0
      if (imageRotation === 'tangent') {
        angle = pos.tangentAngle + (rotationOffset * Math.PI) / 180
      } else if (imageRotation === 'random') {
        angle = seededRandom(i) * Math.PI * 2
      } else {
        angle = (rotationOffset * Math.PI) / 180
      }
      mesh.rotation.z = angle

      // Store metadata for animation
      mesh.userData = {
        baseTheta: pos.theta,
        index: i,
        normalizedT: t,
      }

      this.scene.add(mesh)
      this.imagePlanes.push(mesh)
    })
  }

  updateFading() {
    const { centerFade, edgeFade, centerFadeSharpness, edgeFadeSharpness, backgroundColor } = this.settings

    const [r, g, b] = this.parseHexToRGB(backgroundColor)

    this.imagePlanes.forEach((mesh) => {
      const t = mesh.userData.normalizedT

      // Calculate fade amount (0 = fully visible, 1 = fully faded to background)
      let fadeAmount = 0
      if (centerFade > 0 && t < centerFade) {
        fadeAmount = Math.max(fadeAmount, 1 - Math.pow(t / centerFade, centerFadeSharpness))
      }
      if (edgeFade < 1 && t > edgeFade) {
        fadeAmount = Math.max(fadeAmount, 1 - Math.pow((1 - t) / (1 - edgeFade), edgeFadeSharpness))
      }

      mesh.material.uniforms.fadeAmount.value = Math.max(0, Math.min(1, fadeAmount))
      mesh.material.uniforms.bgColor.value.set(r, g, b)
    })
  }

  updatePositions() {
    const {
      spiralTightness, spiralRotation, imageRotation, rotationOffset,
      imageSpacing
    } = this.settings

    const a = 0.3
    const b = spiralTightness * 10
    const globalRot = (spiralRotation * Math.PI) / 180

    const seededRandom = (i) => {
      const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
      return x - Math.floor(x)
    }

    const maxCount = this.imagePlanes.length

    // Compute the base theta slots (same spacing as buildSpiral)
    const baseThetas = []
    let theta = 0
    for (let i = 0; i < maxCount; i++) {
      baseThetas.push(theta)
      const r = a + b * theta
      const arcStep = Math.max(imageSpacing / Math.max(r, 1.0), 0.25)
      theta += arcStep
    }

    // The total theta span of all slots — this is our wrap range
    const totalSpan = theta
    // Max radius for fade normalization (based on the static spiral, not animated)
    const maxR = a + b * totalSpan

    this.imagePlanes.forEach((mesh, i) => {
      // Shift theta inward (negative = toward center) and wrap around
      let currentTheta = baseThetas[i] - this.animationOffset
      // Wrap: when theta goes below 0, respawn at outer edge
      currentTheta = ((currentTheta % totalSpan) + totalSpan) % totalSpan

      const r = a + b * currentTheta
      const x = r * Math.cos(currentTheta + globalRot)
      const y = r * Math.sin(currentTheta + globalRot)
      const t = Math.max(0, Math.min(1, r / maxR))

      mesh.position.x = x
      mesh.position.y = y
      mesh.userData.normalizedT = t

      // Swap texture when an image wraps around
      const wrapCount = mesh.userData.wrapCount || 0
      const rawTheta = baseThetas[i] - this.animationOffset
      const newWrapCount = Math.floor(-rawTheta / totalSpan)
      if (newWrapCount !== wrapCount && this.loadedTextures.length > 0) {
        mesh.userData.wrapCount = newWrapCount
        // Pick a new texture based on wrap count + index for variety
        const texIdx = (i + newWrapCount * 7) % this.loadedTextures.length
        const newTex = this.loadedTextures[Math.abs(texIdx) % this.loadedTextures.length]
        if (newTex && mesh.material.uniforms.map.value !== newTex) {
          mesh.material.uniforms.map.value = newTex
        }
      }

      let angle = 0
      if (imageRotation === 'tangent') {
        angle = currentTheta + globalRot + Math.PI / 2 + (rotationOffset * Math.PI) / 180
      } else if (imageRotation === 'random') {
        angle = seededRandom(i + (mesh.userData.wrapCount || 0)) * Math.PI * 2
      } else {
        angle = (rotationOffset * Math.PI) / 180
      }
      mesh.rotation.z = angle
    })
  }

  animate = () => {
    if (this.disposed) return
    this.animationId = requestAnimationFrame(this.animate)

    if (this.settings.animationEnabled) {
      this.animationOffset += this.settings.animationSpeed * 0.005
    }

    this.updatePositions()
    this.updateFading()
    this.renderer.render(this.scene, this.camera)
  }

  updateCamera() {
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    if (w === 0 || h === 0) return

    const aspect = w / h
    this.camera.left = -this.frustumSize * aspect / 2
    this.camera.right = this.frustumSize * aspect / 2
    this.camera.top = this.frustumSize / 2
    this.camera.bottom = -this.frustumSize / 2
    this.camera.updateProjectionMatrix()
  }

  resize() {
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    if (w === 0 || h === 0) return

    this.updateCamera()
    this.renderer.setSize(w, h)
  }

  updateSettings(newSettings) {
    const needsRebuild = [
      'density', 'baseSize', 'sizeGrowth', 'aspectRatio', 'borderRadius',
      'maxTurns', 'spiralTightness', 'imageSpacing'
    ]

    const oldSettings = { ...this.settings }
    Object.assign(this.settings, newSettings)

    // Update background color
    if (newSettings.backgroundColor !== undefined) {
      this.scene.background = new THREE.Color(this.settings.backgroundColor)
    }

    // Update zoom without rebuild
    if (newSettings.zoom !== undefined) {
      this.frustumSize = this.settings.zoom
      this.updateCamera()
    }

    // Check if we need a full rebuild
    const rebuild = needsRebuild.some(key => oldSettings[key] !== this.settings[key])
    if (rebuild) {
      this.buildSpiral()
    }
  }

  randomize() {
    return {
      spiralTightness: 0.05 + Math.random() * 0.25,
      imageSpacing: 0.15 + Math.random() * 0.6,
      maxTurns: 3 + Math.floor(Math.random() * 6),
      spiralRotation: Math.random() * 360,
      baseSize: 0.6 + Math.random() * 1.5,
      sizeGrowth: Math.random() * 0.2,
      aspectRatio: 0.8 + Math.random() * 0.8,
      borderRadius: Math.random() * 0.4,
      rotationOffset: Math.random() * 360,
      imageRotation: ['tangent', 'fixed', 'random'][Math.floor(Math.random() * 3)],
      animationSpeed: 0.1 + Math.random() * 0.8,
      centerFade: Math.random() * 0.3,
      edgeFade: 0.7 + Math.random() * 0.3,
      density: 40 + Math.floor(Math.random() * 80),
    }
  }

  getDefaults() {
    return { ...DEFAULT_SETTINGS }
  }

  dispose() {
    this.disposed = true
    if (this.animationId) cancelAnimationFrame(this.animationId)
    window.removeEventListener('resize', this._onResize)

    this.imagePlanes.forEach(p => {
      this.scene.remove(p)
      p.geometry.dispose()
      p.material.dispose()
    })
    this.textures.forEach(t => {
      if (t) t.dispose()
    })
    this.renderer.dispose()
  }
}
