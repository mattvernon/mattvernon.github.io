import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    proxy: {
      '/api/cosmos-profile': {
        target: 'https://cosmos.so',
        changeOrigin: true,
        followRedirects: true,
        rewrite: (path) => path.replace(/^\/api\/cosmos-profile/, ''),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['cross-origin-resource-policy'] = 'cross-origin'
          })
        },
      },
      '/api/cosmos': {
        target: 'https://cdn.cosmos.so',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cosmos/, ''),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['cross-origin-resource-policy'] = 'cross-origin'
          })
        },
      },
    },
  },
})
