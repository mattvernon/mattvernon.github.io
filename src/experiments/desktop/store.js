import { create } from 'zustand'
import { APPS } from './constants'

// Initial windows open on load
// Order in array = back-to-front z-order
const INITIAL_WINDOWS = [
  {
    id: 'textedit-init',
    appId: 'textedit',
    title: 'TextEdit',
    position: { x: 25, y: 35 },
    size: { w: 375, h: 240 },
    isMinimized: false,
  },
  {
    id: 'browser-init',
    appId: 'browser',
    title: 'Safari',
    position: { x: 420, y: 35 },
    size: { w: 650, h: 550 },
    isMinimized: false,
  },
  {
    id: 'y2kracer-init',
    appId: 'y2kracer',
    title: 'y2k_racer',
    position: { x: 475, y: 370 },
    size: { w: 1000, h: 600 },
    isMinimized: false,
  },
  {
    id: 'quicktime-init',
    appId: 'quicktime',
    title: 'Welcome.mp4 — QuickTime Player',
    position: { x: 85, y: 255 },
    size: { w: 750, h: 510 },
    isMinimized: false,
  },
]

const useDesktopStore = create((set) => ({
  windows: INITIAL_WINDOWS,
  windowOrder: INITIAL_WINDOWS.map((w) => w.id),
  focusedWindowId: 'quicktime-init',
  selectedIconId: null,

  selectIcon: (iconId) => set({ selectedIconId: iconId }),
  clearIconSelection: () => set({ selectedIconId: null }),

  openWindow: (appId) =>
    set((state) => {
      const app = APPS[appId]
      if (!app) return state

      const id = `${appId}-${Date.now()}`
      // Offset position slightly if windows already open
      const offset = state.windows.length * 20

      return {
        windows: [
          ...state.windows,
          {
            id,
            appId: app.id,
            title: app.name,
            position: {
              x: app.defaultPosition.x + offset,
              y: app.defaultPosition.y + offset,
            },
            size: { ...app.defaultSize },
            isMinimized: false,
          },
        ],
        windowOrder: [...state.windowOrder, id],
        focusedWindowId: id,
      }
    }),

  closeWindow: (windowId) =>
    set((state) => {
      const newOrder = state.windowOrder.filter((id) => id !== windowId)
      return {
        windows: state.windows.filter((w) => w.id !== windowId),
        windowOrder: newOrder,
        focusedWindowId:
          state.focusedWindowId === windowId
            ? newOrder[newOrder.length - 1] || null
            : state.focusedWindowId,
      }
    }),

  minimizeWindow: (windowId) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId ? { ...w, isMinimized: true } : w
      ),
      focusedWindowId:
        state.focusedWindowId === windowId
          ? state.windowOrder
              .filter((id) => id !== windowId)
              .slice(-1)[0] || null
          : state.focusedWindowId,
    })),

  bringToFront: (windowId) =>
    set((state) => ({
      windowOrder: [
        ...state.windowOrder.filter((id) => id !== windowId),
        windowId,
      ],
      focusedWindowId: windowId,
    })),

  updatePosition: (windowId, position) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId ? { ...w, position } : w
      ),
    })),

  updateSize: (windowId, size) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === windowId ? { ...w, size } : w
      ),
    })),
}))

export default useDesktopStore
