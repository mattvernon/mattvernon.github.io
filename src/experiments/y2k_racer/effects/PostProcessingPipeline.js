import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { PixelationShader } from './PixelationPass.js'
import { CRTShader } from './CRTPass.js'
import { BLOOM_STRENGTH, BLOOM_RADIUS, BLOOM_THRESHOLD, PIXEL_SIZE } from '../constants.js'

export default class PostProcessingPipeline {
  constructor(renderer, scene, camera) {
    this.renderer = renderer
    this.scene = scene
    this.camera = camera

    const size = renderer.getSize(new THREE.Vector2())
    this.width = size.x
    this.height = size.y

    this.composer = new EffectComposer(renderer)

    // 1. Render pass
    const renderPass = new RenderPass(scene, camera)
    this.composer.addPass(renderPass)

    // 2. Bloom pass (neon glow)
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      BLOOM_STRENGTH,
      BLOOM_RADIUS,
      BLOOM_THRESHOLD
    )
    this.composer.addPass(this.bloomPass)

    // 3. Pixelation pass
    this.pixelPass = new ShaderPass(PixelationShader)
    this.pixelPass.uniforms.resolution.value = new THREE.Vector2(this.width, this.height)
    this.pixelPass.uniforms.pixelSize.value = PIXEL_SIZE
    this.composer.addPass(this.pixelPass)

    // 4. CRT pass
    this.crtPass = new ShaderPass(CRTShader)
    this.crtPass.uniforms.resolution.value = new THREE.Vector2(this.width, this.height)
    this.composer.addPass(this.crtPass)
  }

  update(time) {
    this.crtPass.uniforms.time.value = time
  }

  render() {
    this.composer.render()
  }

  resize(width, height) {
    this.width = width
    this.height = height
    this.composer.setSize(width, height)
    this.bloomPass.resolution.set(width, height)
    this.pixelPass.uniforms.resolution.value.set(width, height)
    this.crtPass.uniforms.resolution.value.set(width, height)
  }

  dispose() {
    this.composer.dispose()
  }
}
