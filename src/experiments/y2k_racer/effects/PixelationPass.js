const PixelationShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: null },
    pixelSize: { value: 3.0 },
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
    uniform float pixelSize;
    varying vec2 vUv;

    void main() {
      vec2 dxy = pixelSize / resolution;
      vec2 coord = dxy * floor(vUv / dxy) + dxy * 0.5;
      gl_FragColor = texture2D(tDiffuse, coord);
    }
  `,
}

export { PixelationShader }
