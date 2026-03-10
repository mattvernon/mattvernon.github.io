import { CROSSFADE_DURATION } from '../constants'

export class MusicManager {
  constructor() {
    this.audioA = new Audio()
    this.audioB = new Audio()
    this.audioA.preload = 'auto'
    this.audioB.preload = 'auto'
    this.current = 'A'
    this.playlist = []
    this.trackIndex = 0
    this.crossfading = false
    this._fadeInterval = null
    this.onTrackChange = null

    this.muted = false

    this.audioA.addEventListener('ended', () => this._handleEnded('A'))
    this.audioB.addEventListener('ended', () => this._handleEnded('B'))
  }

  get currentAudio() {
    return this.current === 'A' ? this.audioA : this.audioB
  }

  get nextAudio() {
    return this.current === 'A' ? this.audioB : this.audioA
  }

  loadPlaylist(tracks) {
    this.playlist = tracks
    this.trackIndex = 0
    if (tracks.length > 0) {
      this.currentAudio.src = `/music/forever/${tracks[0].src}`
    }
  }

  async play() {
    try {
      await this.currentAudio.play()
    } catch {
      // Autoplay blocked — will retry on next user interaction
    }
  }

  pause() {
    this.currentAudio.pause()
    this.nextAudio.pause()
  }

  _handleEnded(which) {
    if (this.crossfading) return
    if (which === this.current) {
      this._advanceTrack()
    }
  }

  _advanceTrack() {
    if (this.playlist.length <= 1) {
      // Loop single track
      this.currentAudio.currentTime = 0
      this.currentAudio.play()
      return
    }

    const nextIndex = (this.trackIndex + 1) % this.playlist.length
    this._crossfadeTo(nextIndex)
  }

  _crossfadeTo(nextIndex) {
    if (this.crossfading) return
    this.crossfading = true

    const fadeDuration = CROSSFADE_DURATION
    const steps = 30
    const stepTime = fadeDuration / steps
    let step = 0

    const outAudio = this.currentAudio
    const inAudio = this.nextAudio

    inAudio.src = `/music/forever/${this.playlist[nextIndex].src}`
    inAudio.volume = 0
    inAudio.currentTime = 0
    inAudio.play().catch(() => {})

    this._fadeInterval = setInterval(() => {
      step++
      const progress = step / steps
      outAudio.volume = Math.max(0, 1 - progress)
      inAudio.volume = Math.min(1, progress)

      if (step >= steps) {
        clearInterval(this._fadeInterval)
        outAudio.pause()
        outAudio.volume = 1
        outAudio.currentTime = 0

        this.current = this.current === 'A' ? 'B' : 'A'
        this.trackIndex = nextIndex
        this.crossfading = false

        if (this.onTrackChange) {
          this.onTrackChange(nextIndex, this.playlist[nextIndex])
        }
      }
    }, stepTime)
  }

  toggleMute() {
    this.muted = !this.muted
    this.audioA.muted = this.muted
    this.audioB.muted = this.muted
    return this.muted
  }

  skipTrack() {
    if (this.playlist.length <= 1) return
    const nextIndex = (this.trackIndex + 1) % this.playlist.length
    this._crossfadeTo(nextIndex)
  }

  dispose() {
    clearInterval(this._fadeInterval)
    this.audioA.pause()
    this.audioB.pause()
    this.audioA.src = ''
    this.audioB.src = ''
  }
}
