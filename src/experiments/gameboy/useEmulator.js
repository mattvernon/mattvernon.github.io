import { useRef, useEffect, useCallback, useState } from 'react'

const ROM_URL = '/roms/Pokemon - Silver Version.gbc'

// Load order matters — globals first, then dependencies, then core, then IO
const SCRIPTS = [
  '/emulator/globals.js',
  '/emulator/XAudioServer.js',
  '/emulator/resampler.js',
  '/emulator/resize.js',
  '/emulator/GameBoyCore.js',
  '/emulator/GameBoyIO.js',
]

let scriptsLoaded = false
let scriptsLoading = false

function loadScripts() {
  if (scriptsLoaded) return Promise.resolve()
  if (scriptsLoading) {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (scriptsLoaded) {
          clearInterval(check)
          resolve()
        }
      }, 50)
    })
  }

  scriptsLoading = true
  return SCRIPTS.reduce((chain, src) => {
    return chain.then(
      () =>
        new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = src
          script.onload = resolve
          script.onerror = () => reject(new Error(`Failed to load ${src}`))
          document.head.appendChild(script)
        }),
    )
  }, Promise.resolve()).then(() => {
    scriptsLoaded = true
  })
}

// Convert ArrayBuffer to binary string (GameBoy-Online expects this format)
function arrayBufferToBinaryString(buffer) {
  const bytes = new Uint8Array(buffer)
  const chunks = []
  // Process in chunks to avoid call stack limits
  for (let i = 0; i < bytes.length; i += 8192) {
    const chunk = bytes.subarray(i, Math.min(i + 8192, bytes.length))
    chunks.push(String.fromCharCode.apply(null, chunk))
  }
  return chunks.join('')
}

// Key code to GameBoy button index mapping
// Order: Right=0, Left=1, Up=2, Down=3, A=4, B=5, Select=6, Start=7
const KEY_MAP = {
  ArrowRight: 0,
  ArrowLeft: 1,
  ArrowUp: 2,
  ArrowDown: 3,
  x: 4,
  X: 4,
  z: 5,
  Z: 5,
  Shift: 6,
  Enter: 7,
}

export default function useEmulator() {
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const initCalled = useRef(false)

  const init = useCallback(async () => {
    if (!canvasRef.current || initCalled.current) return
    initCalled.current = true

    try {
      setStatus('loading')

      // Load emulator scripts
      await loadScripts()

      // Fetch ROM as ArrayBuffer and convert to binary string
      const response = await fetch(ROM_URL)
      if (!response.ok) throw new Error(`ROM fetch failed: ${response.status}`)
      const buffer = await response.arrayBuffer()
      const romBinaryString = arrayBufferToBinaryString(buffer)

      // Store canvas and ROM for start()
      canvasRef.current._romData = romBinaryString
      setStatus('ready')
    } catch (err) {
      console.error('Emulator init failed:', err)
      setError(err?.message || String(err) || 'Failed to initialize emulator')
      setStatus('error')
    }
  }, [])

  const play = useCallback(async () => {
    if (!canvasRef.current || !canvasRef.current._romData) return

    try {
      // Disable image smoothing for crisp pixel art
      window.settings[13] = false
      // GameBoy-Online's start() creates the core + begins emulation
      window.start(canvasRef.current, canvasRef.current._romData)
      setStatus('playing')
    } catch (err) {
      console.error('Emulator play failed:', err)
      setError(err?.message || String(err))
      setStatus('error')
    }
  }, [])

  const pause = useCallback(() => {
    if (window.GameBoyEmulatorInitialized && window.GameBoyEmulatorInitialized()) {
      window.pause()
      setStatus('ready')
    }
  }, [])

  // Keyboard input handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      const btn = KEY_MAP[e.key]
      if (btn !== undefined && window.gameboy) {
        e.preventDefault()
        window.gameboy.JoyPadEvent(btn, true)
      }
    }

    const handleKeyUp = (e) => {
      const btn = KEY_MAP[e.key]
      if (btn !== undefined && window.gameboy) {
        e.preventDefault()
        window.gameboy.JoyPadEvent(btn, false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      initCalled.current = false
      if (
        window.GameBoyEmulatorInitialized &&
        window.GameBoyEmulatorInitialized() &&
        window.GameBoyEmulatorPlaying &&
        window.GameBoyEmulatorPlaying()
      ) {
        window.clearLastEmulation()
      }
    }
  }, [])

  return { canvasRef, status, error, init, play, pause }
}
