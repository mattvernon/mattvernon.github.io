import { create } from 'zustand'

const useForeverStore = create((set, get) => ({
  // Photos loaded from manifest
  photos: [],
  music: [],
  loading: true,

  loadManifest: async () => {
    try {
      const [photoRes, musicRes] = await Promise.all([
        fetch('/photos/forever/manifest.json'),
        fetch('/music/forever/manifest.json'),
      ])
      const photoList = await photoRes.json()
      const musicList = await musicRes.json()

      set({
        photos: photoList.map((f) => (typeof f === 'string' ? f : f.src || f)),
        music: musicList.map((m) =>
          typeof m === 'string' ? { src: m, title: m } : m
        ),
        loading: false,
      })
    } catch {
      set({ loading: false })
    }
  },

  // Playback state
  currentIndex: 0,
  isPlaying: false,
  hasStarted: false,

  // Music
  currentTrackIndex: 0,
  setCurrentTrackIndex: (i) => set({ currentTrackIndex: i }),

  // Navigation — each photo is one step, +1 for goodbye screen at end
  next: () => {
    const { currentIndex, photos } = get()
    const total = photos.length + 1
    if (currentIndex < total - 1) {
      set({ currentIndex: currentIndex + 1 })
    }
  },
  prev: () => {
    const { currentIndex } = get()
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 })
    }
  },
  goTo: (index) => set({ currentIndex: index }),
  play: () => set({ isPlaying: true, hasStarted: true }),
  pause: () => set({ isPlaying: false }),
  reset: () => set({ currentIndex: 0, isPlaying: false, hasStarted: false }),
}))

export default useForeverStore
