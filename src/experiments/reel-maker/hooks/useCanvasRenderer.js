import { useEffect, useRef } from 'react'
import useReelStore from '../store'
import { calcDrawRect } from '../utils/transforms'
import { getGifFrameIndex } from '../utils/gifDecoder'

export default function useCanvasRenderer(canvasRef, audioRef) {
  const rafRef = useRef(null)
  const lastTimeRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function drawBg(outputWidth, outputHeight, outputBg, itemBg) {
      ctx.fillStyle = outputBg
      ctx.fillRect(0, 0, outputWidth, outputHeight)
      if (itemBg) {
        ctx.fillStyle = itemBg
        ctx.fillRect(0, 0, outputWidth, outputHeight)
      }
    }

    function renderFrame() {
      const state = useReelStore.getState()
      const { outputWidth, outputHeight, outputBg, media, currentTime } = state

      if (canvas.width !== outputWidth) canvas.width = outputWidth
      if (canvas.height !== outputHeight) canvas.height = outputHeight

      const result = state.getItemAtTime(currentTime)
      if (!result) {
        ctx.fillStyle = outputBg
        ctx.fillRect(0, 0, outputWidth, outputHeight)
        return
      }

      const { item, localTime } = result
      const mediaEntry = media[item.mediaId]
      if (!mediaEntry) {
        ctx.fillStyle = outputBg
        ctx.fillRect(0, 0, outputWidth, outputHeight)
        return
      }

      const { drawX, drawY, drawW, drawH } = calcDrawRect(
        mediaEntry.naturalWidth, mediaEntry.naturalHeight,
        outputWidth, outputHeight,
        item.transform
      )

      if (mediaEntry.type === 'video' && mediaEntry.videoEl) {
        const videoEl = mediaEntry.videoEl
        const mediaTime = localTime + (item.startOffset || 0)
        const targetTime = Math.min(mediaTime, mediaEntry.duration || 0)

        // Keep video paused — we use seek-only for reliable frame display
        if (!videoEl.paused) videoEl.pause()

        // Seek if needed, gated so we don't re-seek while one is in-flight
        if (!videoEl._seeking && Math.abs(videoEl.currentTime - targetTime) > 0.04) {
          videoEl._seeking = true
          videoEl.currentTime = targetTime
          videoEl.onseeked = () => { videoEl._seeking = false }
        }

        // Only clear + redraw when video has a drawable frame
        // This prevents black flashes during seeks — canvas keeps last good frame
        if (videoEl.readyState >= 2) {
          drawBg(outputWidth, outputHeight, outputBg, item.background)
          ctx.drawImage(videoEl, drawX, drawY, drawW, drawH)
        }
        return
      }

      // Images and GIFs are always ready — clear and draw immediately
      drawBg(outputWidth, outputHeight, outputBg, item.background)

      if (mediaEntry.type === 'image' && mediaEntry.imageEl) {
        ctx.drawImage(mediaEntry.imageEl, drawX, drawY, drawW, drawH)
      } else if (mediaEntry.type === 'gif' && mediaEntry.gifFrames) {
        const frameIndex = getGifFrameIndex(mediaEntry.gifFrames, localTime + (item.startOffset || 0))
        const frame = mediaEntry.gifFrames[frameIndex]
        if (frame) ctx.drawImage(frame.canvas, drawX, drawY, drawW, drawH)
      }
    }

    function loop(timestamp) {
      const state = useReelStore.getState()

      if (state.isPlaying) {
        if (lastTimeRef.current === null) lastTimeRef.current = timestamp
        const delta = (timestamp - lastTimeRef.current) / 1000
        lastTimeRef.current = timestamp

        const newTime = state.currentTime + delta
        const totalDuration = state.getTotalDuration()
        if (newTime >= totalDuration) {
          useReelStore.getState().pause()
          useReelStore.getState().setCurrentTime(totalDuration)
        } else {
          useReelStore.getState().setCurrentTime(newTime)
        }

        // Sync audio
        if (audioRef?.current) {
          const audio = audioRef.current
          if (audio.paused) {
            audio.currentTime = newTime
            audio.play().catch(() => {})
          } else if (Math.abs(audio.currentTime - newTime) > 0.3) {
            audio.currentTime = newTime
          }
        }
      } else {
        lastTimeRef.current = null
        if (audioRef?.current && !audioRef.current.paused) {
          audioRef.current.pause()
        }
      }

      renderFrame()
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [canvasRef, audioRef])
}
