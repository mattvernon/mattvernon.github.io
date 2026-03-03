import { create } from 'zustand'
import { DEFAULT_BG_COLOR } from './constants'

const useHomeStore = create((set) => ({
  bgColor: DEFAULT_BG_COLOR,
  setBgColor: (color) => set({ bgColor: color }),

  // Drag offsets: { [filename]: { dx, dy } }
  dragOffsets: {},
  setDragOffset: (filename, dx, dy) =>
    set((state) => ({
      dragOffsets: { ...state.dragOffsets, [filename]: { dx, dy } },
    })),

  // Width overrides: { [filename]: widthPx }
  widthOverrides: {},
  setWidthOverride: (filename, width) =>
    set((state) => ({
      widthOverrides: { ...state.widthOverrides, [filename]: width },
    })),

  // Z-order tracking: last item = highest z-index
  zOrder: [],
  bringToFront: (filename) =>
    set((state) => ({
      zOrder: [...state.zOrder.filter((f) => f !== filename), filename],
    })),
}))

export default useHomeStore
