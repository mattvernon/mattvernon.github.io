import { PRELOAD_AHEAD } from '../constants'

const loaded = new Set()

export function preloadImages(photos, currentIndex, ahead = PRELOAD_AHEAD) {
  const end = Math.min(currentIndex + ahead, photos.length)
  for (let i = currentIndex; i < end; i++) {
    const src = `/photos/forever/${photos[i]}`
    if (!loaded.has(src)) {
      loaded.add(src)
      const img = new Image()
      img.src = src
    }
  }
}
