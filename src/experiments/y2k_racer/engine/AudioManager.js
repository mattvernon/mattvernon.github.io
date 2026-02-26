import { MAX_SPEED } from '../constants.js'

const SOUND_PATHS = {
  engine: '/sounds/engine-loop.mp3',
  screech: '/sounds/tire-screech.mp3',
  collision: '/sounds/collision.mp3',
  wind: '/sounds/wind-loop.mp3',
}

const MUSIC_DIR = '/sounds/music/'

// Engine pitch range (playbackRate)
const ENGINE_PITCH_MIN = 0.6
const ENGINE_PITCH_MAX = 2.0
const ENGINE_VOLUME = 0.5

// Wind fades in above this speed ratio (0-1)
const WIND_FADE_START = 0.15
const WIND_VOLUME_MAX = 0.35

// Screech triggers when braking above this speed
const SCREECH_SPEED_THRESHOLD = 8
const SCREECH_VOLUME = 0.4

const COLLISION_VOLUME = 0.6
// Minimum time (seconds) between collision sounds
const COLLISION_COOLDOWN = 1.0
// Minimum speed (internal units) to trigger collision sound (~5 km/h)
const COLLISION_MIN_SPEED = 1.4

// Music
const MUSIC_VOLUME = 0.35
const MUSIC_PAUSED_VOLUME = 0.1
const MUSIC_FADE_MS = 300

export default class AudioManager {
  constructor() {
    this.ctx = null
    this.buffers = {}
    this.sources = {}
    this.gains = {}
    this.ready = false
    this.lastCollisionTime = 0

    // Music state
    this.musicEl = null
    this.musicSource = null
    this.musicGain = null
    this.musicStarted = false

    // Driving sounds gain (muted on pause, full on play)
    this.drivingGain = null
  }

  async init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)()

    // Master gain
    this.masterGain = this.ctx.createGain()
    this.masterGain.gain.value = 1
    this.masterGain.connect(this.ctx.destination)

    // Driving sounds sub-mix (muted when paused)
    this.drivingGain = this.ctx.createGain()
    this.drivingGain.gain.value = 1
    this.drivingGain.connect(this.masterGain)

    // Music gain (ducked when paused)
    this.musicGain = this.ctx.createGain()
    this.musicGain.gain.value = MUSIC_VOLUME
    this.musicGain.connect(this.masterGain)

    // Load all SFX in parallel
    const entries = Object.entries(SOUND_PATHS)
    const results = await Promise.all(
      entries.map(async ([key, path]) => {
        try {
          const res = await fetch(path)
          const buf = await res.arrayBuffer()
          const audioBuf = await this.ctx.decodeAudioData(buf)
          return [key, audioBuf]
        } catch (e) {
          console.warn(`AudioManager: failed to load ${path}`, e)
          return [key, null]
        }
      })
    )

    for (const [key, buf] of results) {
      if (buf) this.buffers[key] = buf
    }

    // Set up looping sources for engine, screech, wind
    this._initLoop('engine', ENGINE_VOLUME)
    this._initLoop('screech', 0) // starts silent
    this._initLoop('wind', 0)    // starts silent

    // Prepare music (HTML audio element for streaming)
    this._initMusic()

    this.ready = true
  }

  _initLoop(name, initialVolume) {
    const buf = this.buffers[name]
    if (!buf) return

    const source = this.ctx.createBufferSource()
    source.buffer = buf
    source.loop = true

    const gain = this.ctx.createGain()
    gain.gain.value = initialVolume
    source.connect(gain)
    gain.connect(this.drivingGain) // route through driving sub-mix
    source.start(0)

    this.sources[name] = source
    this.gains[name] = gain
  }

  _initMusic() {
    this.musicEl = new Audio()
    this.musicEl.loop = true
    this.musicEl.preload = 'auto'
    this.musicEl.src = MUSIC_DIR + 'mall grab - new york.mp3'

    this.musicSource = this.ctx.createMediaElementSource(this.musicEl)
    this.musicSource.connect(this.musicGain)
  }

  startMusic() {
    if (this.musicStarted || !this.musicEl) return
    this.musicStarted = true
    // Resume context if needed (browser autoplay policy)
    if (this.ctx.state === 'suspended') this.ctx.resume()
    this.musicEl.play().catch(() => {})
  }

  setPlaying(playing) {
    if (!this.ctx) return

    if (playing) {
      // Resume audio context if suspended
      if (this.ctx.state === 'suspended') this.ctx.resume()
      // Unmute driving sounds
      this.drivingGain.gain.setTargetAtTime(1, this.ctx.currentTime, 0.02)
      // Restore music volume
      this.musicGain.gain.setTargetAtTime(MUSIC_VOLUME, this.ctx.currentTime, MUSIC_FADE_MS / 1000)
    } else {
      // Mute driving sounds
      this.drivingGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.02)
      // Duck music
      this.musicGain.gain.setTargetAtTime(MUSIC_PAUSED_VOLUME, this.ctx.currentTime, MUSIC_FADE_MS / 1000)
    }
  }

  update(speed, input, collided) {
    if (!this.ready) return

    const absSpeed = Math.abs(speed)
    const speedRatio = absSpeed / MAX_SPEED

    // --- Engine pitch & volume ---
    if (this.sources.engine) {
      const pitch = ENGINE_PITCH_MIN + speedRatio * (ENGINE_PITCH_MAX - ENGINE_PITCH_MIN)
      this.sources.engine.playbackRate.value = pitch

      // Slightly louder at higher speed
      const vol = ENGINE_VOLUME * (0.7 + 0.3 * speedRatio)
      this.gains.engine.gain.value = vol
    }

    // --- Wind volume ---
    if (this.gains.wind) {
      let windVol = 0
      if (speedRatio > WIND_FADE_START) {
        const t = (speedRatio - WIND_FADE_START) / (1 - WIND_FADE_START)
        windVol = t * t * WIND_VOLUME_MAX // quadratic fade-in
      }
      this.gains.wind.gain.value = windVol
    }

    // --- Tire screech ---
    if (this.gains.screech) {
      const braking = input.brake && absSpeed > SCREECH_SPEED_THRESHOLD
      this.gains.screech.gain.value = braking ? SCREECH_VOLUME : 0
    }

    // --- Collision one-shot ---
    if (collided && absSpeed > COLLISION_MIN_SPEED) {
      const now = this.ctx.currentTime
      if (now - this.lastCollisionTime > COLLISION_COOLDOWN) {
        this._playOneShot('collision', COLLISION_VOLUME)
        this.lastCollisionTime = now
      }
    }
  }

  _playOneShot(name, volume) {
    const buf = this.buffers[name]
    if (!buf) return

    const source = this.ctx.createBufferSource()
    source.buffer = buf
    const gain = this.ctx.createGain()
    gain.gain.value = volume
    source.connect(gain)
    gain.connect(this.drivingGain) // route through driving sub-mix
    source.start(0)
  }

  dispose() {
    // Stop music
    if (this.musicEl) {
      this.musicEl.pause()
      this.musicEl.src = ''
      this.musicEl = null
    }

    // Stop all looping sources
    for (const source of Object.values(this.sources)) {
      try { source.stop() } catch (_) { /* already stopped */ }
    }
    this.sources = {}
    this.gains = {}

    if (this.ctx) {
      this.ctx.close()
      this.ctx = null
    }
    this.ready = false
  }
}
