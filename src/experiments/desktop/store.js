import { create } from 'zustand'
import { APPS } from './constants'

// Initial windows open on load
// Order in array = back-to-front z-order
// Helper to centre windows above the dock on first load
function centredWindows() {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900

  const te = { w: 375, h: 240 }
  const qt = { w: 750, h: 510 }
  const gap = 10

  // Stack height: TextEdit + gap + QuickTime
  const stackH = te.h + gap + qt.h
  const topY = Math.max(30, Math.round((vh - stackH) / 2) - 20)

  return [
    {
      id: 'textedit-init',
      appId: 'textedit',
      title: 'TextEdit',
      position: { x: Math.round((vw - te.w) / 2), y: topY },
      size: te,
      isMinimized: false,
    },
    {
      id: 'quicktime-init',
      appId: 'quicktime',
      title: 'Welcome.mp4 — QuickTime Player',
      position: { x: Math.round((vw - qt.w) / 2), y: topY + te.h + gap },
      size: qt,
      isMinimized: false,
    },
  ]
}

const INITIAL_WINDOWS = centredWindows()

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
