import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'

const CRTShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: null },
    time: { value: 0.0 },
    scanlineIntensity: { value: 0.15 },
    vignetteStrength: { value: 0.4 },
    chromaticAberration: { value: 0.003 },
    curvature: { value: 0.02 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float time;
    uniform float scanlineIntensity;
    uniform float vignetteStrength;
    uniform float chromaticAberration;
    uniform float curvature;
    varying vec2 vUv;

    vec2 curveUV(vec2 uv) {
      vec2 curved = uv * 2.0 - 1.0;
      curved *= 1.0 + dot(curved, curved) * curvature;
      return curved * 0.5 + 0.5;
    }

    void main() {
      vec2 uv = curveUV(vUv);

      // Out of bounds check (from curvature)
      if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
      }

      // Chromatic aberration
      float r = texture2D(tDiffuse, vec2(uv.x + chromaticAberration, uv.y)).r;
      float g = texture2D(tDiffuse, uv).g;
      float b = texture2D(tDiffuse, vec2(uv.x - chromaticAberration, uv.y)).b;
      vec3 color = vec3(r, g, b);

      // Scanlines
      float scanline = 1.0 - scanlineIntensity * (0.5 + 0.5 * sin(uv.y * resolution.y * 3.14159));

      // Subtle horizontal noise line (moving)
      float noiseLine = 1.0 - 0.03 * step(0.998, fract(sin(time * 10.0 + uv.y * 100.0) * 43758.5453));

      // Vignette
      vec2 vigUv = uv * (1.0 - uv);
      float vignette = vigUv.x * vigUv.y * 15.0;
      vignette = pow(vignette, vignetteStrength);

      color *= scanline * noiseLine * vignette;

      // Slight color boost for that CRT warmth
      color = pow(color, vec3(0.95));

      gl_FragColor = vec4(color, 1.0);
    }
  `,
}

export function createCRTPass(THREE, width, height) {
  const pass = new ShaderPass(CRTShader)
  pass.uniforms.resolution.value = new THREE.Vector2(width, height)
  return pass
}

export { CRTShader }
