import { create } from 'zustand'
import { fetchCosmosProfile } from './cosmosApi'
import { autoLayout } from './layoutEngine'

const useMoodboardStore = create((set, get) => ({
  viewport: { x: 0, y: 0, zoom: 0.4 },
  elements: [],
  selectedId: null,

  // Profile state
  profileUsername: 'andy',
  profileUser: null,
  isLoading: false,
  error: null,

  setViewport: (viewport) => set({ viewport }),

  pan: (dx, dy) => set((state) => ({
    viewport: {
      ...state.viewport,
      x: state.viewport.x + dx,
      y: state.viewport.y + dy,
    },
  })),

  zoom: (newZoom, focalX, focalY) => set((state) => {
    const { x, y, zoom } = state.viewport
    const clamped = Math.max(0.08, Math.min(3, newZoom))
    const scale = clamped / zoom
    return {
      viewport: {
        x: focalX - (focalX - x) * scale,
        y: focalY - (focalY - y) * scale,
        zoom: clamped,
      },
    }
  }),

  moveElement: (id, dx, dy) => set((state) => ({
    elements: state.elements.map((el) =>
      el.id === id ? { ...el, x: el.x + dx, y: el.y + dy } : el
    ),
  })),

  selectElement: (id) => set({ selectedId: id }),

  fitToView: () => set((state) => {
    const els = state.elements
    if (els.length === 0) return state

    const padding = 120
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    els.forEach((el) => {
      minX = Math.min(minX, el.x)
      minY = Math.min(minY, el.y)
      maxX = Math.max(maxX, el.x + el.width)
      maxY = Math.max(maxY, el.y + el.height)
    })

    const contentW = maxX - minX + padding * 2
    const viewW = window.innerWidth
    const viewH = window.innerHeight

    const zoom = viewW / contentW
    const x = (viewW - contentW * zoom) / 2 - (minX - padding) * zoom
    const y = (viewH / 2) - ((minY + maxY) / 2) * zoom

    return { viewport: { x, y, zoom } }
  }),

  bringToFront: (id) => set((state) => {
    const idx = state.elements.findIndex((el) => el.id === id)
    if (idx === -1) return state
    const el = state.elements[idx]
    const newElements = [...state.elements]
    newElements.splice(idx, 1)
    newElements.push(el)
    return { elements: newElements }
  }),

  loadProfile: async (username) => {
    set({ isLoading: true, error: null })
    try {
      const { user, elements } = await fetchCosmosProfile(username)
      const laid = autoLayout(elements)
      set({
        elements: laid,
        profileUsername: username,
        profileUser: user,
        isLoading: false,
        selectedId: null,
      })
      // Defer fitToView so elements are in DOM
      setTimeout(() => get().fitToView(), 0)
    } catch (err) {
      set({ isLoading: false, error: err.message })
    }
  },

  clearError: () => set({ error: null }),
}))

export default useMoodboardStore
