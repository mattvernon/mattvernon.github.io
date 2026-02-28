import { create } from 'zustand'

let nextId = 1
const uid = () => `item-${nextId++}`

const PRESETS = {
  square: { width: 1080, height: 1080 },
  landscape: { width: 1920, height: 1080 },
  portrait: { width: 1080, height: 1920 },
}

const useReelStore = create((set, get) => ({
  // ── Output Settings ──
  outputWidth: 1080,
  outputHeight: 1080,
  outputBg: '#000000',

  setOutputSize: (w, h) => set({ outputWidth: w, outputHeight: h }),
  applyPreset: (key) => {
    const p = PRESETS[key]
    if (p) set({ outputWidth: p.width, outputHeight: p.height })
  },
  setOutputBg: (color) => set({ outputBg: color }),

  // ── Media Library ──
  media: {},

  addMedia: (entry) => set((s) => ({
    media: { ...s.media, [entry.id]: entry },
  })),
  removeMedia: (mediaId) => set((s) => {
    const copy = { ...s.media }
    const entry = copy[mediaId]
    if (entry) {
      URL.revokeObjectURL(entry.objectUrl)
      if (entry.thumbnailUrl) URL.revokeObjectURL(entry.thumbnailUrl)
    }
    delete copy[mediaId]
    return {
      media: copy,
      timeline: s.timeline.filter((t) => t.mediaId !== mediaId),
    }
  }),

  // ── Timeline ──
  timeline: [],

  addToTimeline: (mediaId) => set((s) => {
    const m = s.media[mediaId]
    if (!m) return s
    // Use media duration if available (videos/gifs), otherwise default 0.5s
    const dur = m.duration ? Math.min(m.duration, 10) : 0.5
    return {
      timeline: [...s.timeline, {
        id: uid(),
        mediaId,
        startOffset: 0,
        duration: Math.round(dur * 10) / 10,
        background: null,
        transform: { scale: 100, x: 0, y: 0 },
      }],
    }
  }),
  removeFromTimeline: (itemId) => set((s) => ({
    timeline: s.timeline.filter((t) => t.id !== itemId),
  })),
  reorderTimeline: (fromIndex, toIndex) => set((s) => {
    const arr = [...s.timeline]
    const [moved] = arr.splice(fromIndex, 1)
    arr.splice(toIndex, 0, moved)
    return { timeline: arr }
  }),
  updateItem: (itemId, patch) => set((s) => ({
    timeline: s.timeline.map((t) =>
      t.id === itemId ? { ...t, ...patch } : t
    ),
  })),
  updateItemTransform: (itemId, transformPatch) => set((s) => ({
    timeline: s.timeline.map((t) =>
      t.id === itemId
        ? { ...t, transform: { ...t.transform, ...transformPatch } }
        : t
    ),
  })),

  // ── Selection ──
  selectedItemId: null,
  selectItem: (id) => set({ selectedItemId: id }),

  // ── Clipboard (for batch transform) ──
  copiedTransform: null,
  copyTransform: () => {
    const s = get()
    const item = s.timeline.find((t) => t.id === s.selectedItemId)
    if (item) set({ copiedTransform: { ...item.transform, background: item.background } })
  },
  pasteTransform: (targetId) => set((s) => {
    if (!s.copiedTransform) return s
    const { background, ...transform } = s.copiedTransform
    return {
      timeline: s.timeline.map((t) =>
        t.id === targetId
          ? { ...t, transform: { ...transform }, background }
          : t
      ),
    }
  }),
  applyTransformToAll: () => set((s) => {
    if (!s.copiedTransform) return s
    const { background, ...transform } = s.copiedTransform
    return {
      timeline: s.timeline.map((t) => ({
        ...t,
        transform: { ...transform },
        background,
      })),
    }
  }),

  // ── Playback ──
  isPlaying: false,
  currentTime: 0,

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  seek: (time) => set({ currentTime: Math.max(0, time), isPlaying: false }),
  setCurrentTime: (time) => set({ currentTime: time }),

  // ── Soundtrack ──
  soundtrack: null,
  setSoundtrack: (entry) => set((s) => {
    if (s.soundtrack) URL.revokeObjectURL(s.soundtrack.objectUrl)
    return { soundtrack: entry }
  }),
  removeSoundtrack: () => set((s) => {
    if (s.soundtrack) URL.revokeObjectURL(s.soundtrack.objectUrl)
    return { soundtrack: null }
  }),

  // ── Export ──
  exportState: 'idle',
  exportProgress: 0,
  setExportState: (state) => set({ exportState: state }),
  setExportProgress: (p) => set({ exportProgress: p }),

  // ── Derived helpers ──
  getTotalDuration: () => {
    return get().timeline.reduce((sum, item) => sum + item.duration, 0)
  },
  getItemAtTime: (time) => {
    const tl = get().timeline
    let elapsed = 0
    for (let i = 0; i < tl.length; i++) {
      const item = tl[i]
      const isLast = i === tl.length - 1
      // Include end boundary for last item so final frame renders
      const inRange = isLast
        ? (time >= elapsed && time <= elapsed + item.duration)
        : (time >= elapsed && time < elapsed + item.duration)
      if (inRange) {
        return { item, localTime: Math.min(time - elapsed, item.duration), startTime: elapsed }
      }
      elapsed += item.duration
    }
    return null
  },
}))

export default useReelStore
