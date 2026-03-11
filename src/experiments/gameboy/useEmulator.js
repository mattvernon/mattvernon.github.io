import { useRef, useEffect, useCallback, useState } from 'react'
// Use the TS (non-WASM) build — the WASM build has Worker loading issues with Vite
import { WasmBoy } from 'wasmboy/dist/wasmboy.ts.esm.js'

const ROM_URL = '/roms/Pokemon - Silver Version.gbc'

export default function useEmulator() {
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('idle') // 'idle' | 'loading' | 'ready' | 'playing' | 'error'
  const [error, setError] = useState(null)
  const initCalled = useRef(false)

  const init = useCallback(async () => {
    if (!canvasRef.current || initCalled.current) return
    initCalled.current = true

    try {
      setStatus('loading')

      await WasmBoy.config(
        {
          useGbcWhenOptional: true,
          isAudioEnabled: true,
          gameboyFPSCap: 60,
          isGbcColorizationEnabled: true,
          enableAudioDebugging: false,
          onPlay: () => setStatus('playing'),
          onPause: () => setStatus('ready'),
        },
        canvasRef.current,
      )

      await WasmBoy.loadROM(ROM_URL)
      setStatus('ready')
    } catch (err) {
      console.error('WasmBoy init failed:', err, JSON.stringify(err))
      setError(err?.message || String(err) || 'Failed to initialize emulator')
      setStatus('error')
    }
  }, [])

  const play = useCallback(async () => {
    WasmBoy.resumeAudioContext()
    await WasmBoy.play()
  }, [])

  const pause = useCallback(async () => {
    await WasmBoy.pause()
  }, [])

  useEffect(() => {
    return () => {
      initCalled.current = false
      if (WasmBoy.isPlaying()) {
        WasmBoy.pause().catch(() => {})
      }
    }
  }, [])

  return { canvasRef, status, error, init, play, pause }
}
