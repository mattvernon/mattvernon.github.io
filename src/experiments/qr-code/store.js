import { create } from 'zustand'

const PALETTE = [
  '#1a0a4a', '#0f172a', '#1e3a5f', '#14532d', '#7f1d1d',
  '#4c1d95', '#831843', '#92400e', '#1e1b4b', '#064e3b',
  '#312e81', '#3f3f46', '#0c4a6e', '#701a75', '#365314',
]

const STYLES = ['square', 'dots', 'rounded']

const useQrStore = create((set) => ({
  url: '',
  pixelStyle: 'square',
  bgColor: '#FFFFFF',
  codeColor: '#1a0a4a',
  logoDataUrl: null,
  padding: 10,
  density: 'medium',

  setUrl: (url) => set({ url }),
  setPixelStyle: (pixelStyle) => set({ pixelStyle }),
  setBgColor: (bgColor) => set({ bgColor }),
  setCodeColor: (codeColor) => set({ codeColor }),
  setPadding: (padding) => set({ padding }),
  setDensity: (density) => set({ density }),

  setLogo: (file) => {
    const reader = new FileReader()
    reader.onload = (e) => set({ logoDataUrl: e.target.result })
    reader.readAsDataURL(file)
  },

  clearLogo: () => set({ logoDataUrl: null }),

  randomize: () => set({
    codeColor: PALETTE[Math.floor(Math.random() * PALETTE.length)],
    pixelStyle: STYLES[Math.floor(Math.random() * STYLES.length)],
  }),
}))

export default useQrStore
