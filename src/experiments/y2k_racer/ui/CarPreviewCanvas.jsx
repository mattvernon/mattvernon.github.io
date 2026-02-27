import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { loadCarModel } from '../vehicles/CarModel.js'

const ROTATION_SPEED = 0.5 // radians/sec — full 360° in ~12.6s
const BG_COLOR = 0x0a0a15

export default function CarPreviewCanvas({ modelKey }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Measure the container to size the renderer
    const parent = canvas.parentElement
    const rect = parent.getBoundingClientRect()
    const width = Math.round(rect.width)
    const height = Math.round(rect.height)
    if (width === 0 || height === 0) return

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'default',
    })
    renderer.setSize(width, height, false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(BG_COLOR)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(BG_COLOR)

    // Camera — 3/4 showcase angle
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50)
    camera.position.set(4, 2.5, 4)
    camera.lookAt(0, 0.5, 0)

    // Car group (turntable target)
    const carGroup = new THREE.Group()
    scene.add(carGroup)

    // Load model — no lights/glow for the preview, just the car body
    loadCarModel(carGroup, modelKey, { includeLights: false })

    // Animation loop — no post-processing needed without glow meshes
    const clock = new THREE.Clock()
    let animFrameId = null

    function animate() {
      animFrameId = requestAnimationFrame(animate)
      const delta = Math.min(clock.getDelta(), 0.1)
      carGroup.rotation.y += ROTATION_SPEED * delta
      renderer.render(scene, camera)
    }
    clock.start()
    animate()

    // Resize handler
    function onResize() {
      const r = parent.getBoundingClientRect()
      const w = Math.round(r.width)
      const h = Math.round(r.height)
      if (w === 0 || h === 0) return
      canvas.width = w
      canvas.height = h
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', onResize)
      if (animFrameId) cancelAnimationFrame(animFrameId)
      clock.stop()

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
          mats.forEach((m) => {
            if (m.map) m.map.dispose()
            m.dispose()
          })
        }
      })

      renderer.dispose()
    }
  }, [modelKey])

  return (
    <canvas
      ref={canvasRef}
      className="car-preview-canvas"
    />
  )
}
