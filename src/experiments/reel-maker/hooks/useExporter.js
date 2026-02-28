import { useRef, useCallback } from 'react'
import useReelStore from '../store'
import { calcDrawRect } from '../utils/transforms'
import { getGifFrameIndex } from '../utils/gifDecoder'

const FPS = 30

function renderFrameAt(ctx, state, time, width, height) {
  const { outputBg, media } = state

  ctx.fillStyle = outputBg
  ctx.fillRect(0, 0, width, height)

  const result = state.getItemAtTime(time)
  if (!result) return

  const { item, localTime } = result
  const mediaEntry = media[item.mediaId]
  if (!mediaEntry) return

  if (item.background) {
    ctx.fillStyle = item.background
    ctx.fillRect(0, 0, width, height)
  }

  const { drawX, drawY, drawW, drawH } = calcDrawRect(
    mediaEntry.naturalWidth, mediaEntry.naturalHeight,
    width, height,
    item.transform
  )

  if (mediaEntry.type === 'image' && mediaEntry.imageEl) {
    ctx.drawImage(mediaEntry.imageEl, drawX, drawY, drawW, drawH)
  } else if (mediaEntry.type === 'gif' && mediaEntry.gifFrames) {
    const frameIndex = getGifFrameIndex(mediaEntry.gifFrames, localTime + (item.startOffset || 0))
    const frame = mediaEntry.gifFrames[frameIndex]
    if (frame) ctx.drawImage(frame.canvas, drawX, drawY, drawW, drawH)
  } else if (mediaEntry.type === 'video') {
    if (mediaEntry._exportVideoEl && mediaEntry._exportVideoEl.readyState >= 2) {
      ctx.drawImage(mediaEntry._exportVideoEl, drawX, drawY, drawW, drawH)
    }
  }
}

// Custom classic worker wrapper — bypasses @ffmpeg/ffmpeg's broken module worker
function createFFmpegWorker() {
  let idCounter = 0
  const pending = {}
  let progressCb = null
  let logCb = null

  const worker = new Worker('/ffmpeg/worker.js')
  worker.onmessage = ({ data }) => {
    if (data.type === 'progress' && progressCb) {
      progressCb(data.data)
    } else if (data.type === 'log' && logCb) {
      logCb(data.data)
    } else if (data.id !== undefined && pending[data.id]) {
      if (data.type === 'error') {
        pending[data.id].reject(new Error(data.data))
      } else {
        pending[data.id].resolve(data.data)
      }
      delete pending[data.id]
    }
  }

  function send(msg, transfer) {
    const id = idCounter++
    msg.id = id
    return new Promise((resolve, reject) => {
      pending[id] = { resolve, reject }
      worker.postMessage(msg, transfer || [])
    })
  }

  return {
    load: (coreURL, wasmURL) => send({ type: 'load', coreURL, wasmURL }),
    exec: (args) => send({ type: 'exec', args }),
    writeFile: (path, data) => {
      const transfer = data instanceof Uint8Array ? [data.buffer] : []
      return send({ type: 'writeFile', path, data }, transfer)
    },
    readFile: (path) => send({ type: 'readFile', path }),
    deleteFile: (path) => send({ type: 'deleteFile', path }),
    onProgress: (cb) => { progressCb = cb },
    onLog: (cb) => { logCb = cb },
    terminate: () => worker.terminate(),
  }
}

export default function useExporter() {
  const workerRef = useRef(null)

  const exportVideo = useCallback(async () => {
    const store = useReelStore.getState()
    const { outputWidth, outputHeight, media, soundtrack } = store
    const totalDuration = store.getTotalDuration()
    const totalFrames = Math.ceil(totalDuration * FPS)

    if (totalFrames === 0) return null

    store.setExportState('loading')
    store.setExportProgress(0)

    try {
      // Load our custom classic worker with FFmpeg core
      if (!workerRef.current) {
        const { toBlobURL } = await import('@ffmpeg/util')
        const ffmpeg = createFFmpegWorker()
        ffmpeg.onLog(({ message }) => console.log('[ffmpeg]', message))

        const baseURL = window.location.origin + '/ffmpeg'
        const coreURL = await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript')
        const wasmURL = await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')

        console.log('[reel-maker] Loading FFmpeg core...')
        await ffmpeg.load(coreURL, wasmURL)
        console.log('[reel-maker] FFmpeg loaded')
        workerRef.current = ffmpeg
      }
      const ffmpeg = workerRef.current

      store.setExportState('encoding')
      store.setExportProgress(0)

      ffmpeg.onProgress(({ progress }) => {
        store.setExportProgress(0.5 + (progress || 0) * 0.5)
      })

      // Prepare video elements for export
      const videoEntries = Object.values(media).filter((m) => m.type === 'video')
      for (const entry of videoEntries) {
        if (!entry._exportVideoEl) {
          const video = document.createElement('video')
          video.src = entry.objectUrl
          video.muted = true
          video.preload = 'auto'
          video.playsInline = true
          await new Promise((resolve) => {
            video.onloadeddata = resolve
            video.onerror = resolve
          })
          entry._exportVideoEl = video
        }
      }

      // Offscreen canvas
      const offscreen = document.createElement('canvas')
      offscreen.width = outputWidth
      offscreen.height = outputHeight
      const ctx = offscreen.getContext('2d')

      // Render and write frames
      for (let i = 0; i < totalFrames; i++) {
        const time = i / FPS

        const result = store.getItemAtTime(time)
        if (result) {
          const entry = media[result.item.mediaId]
          if (entry?.type === 'video' && entry._exportVideoEl) {
            const mediaTime = result.localTime + (result.item.startOffset || 0)
            const targetTime = Math.min(mediaTime, entry.duration || 0)
            entry._exportVideoEl.currentTime = targetTime
            await new Promise((resolve) => {
              if (entry._exportVideoEl.readyState >= 2) resolve()
              else {
                entry._exportVideoEl.onseeked = resolve
                setTimeout(resolve, 100)
              }
            })
          }
        }

        renderFrameAt(ctx, store, time, outputWidth, outputHeight)

        const blob = await new Promise((r) => offscreen.toBlob(r, 'image/jpeg', 0.9))
        const data = new Uint8Array(await blob.arrayBuffer())
        await ffmpeg.writeFile(`frame${String(i).padStart(6, '0')}.jpg`, data)

        store.setExportProgress((i / totalFrames) * 0.5)
      }

      // Write soundtrack
      let audioArgs = []
      if (soundtrack) {
        const resp = await fetch(soundtrack.objectUrl)
        const audioData = new Uint8Array(await resp.arrayBuffer())
        await ffmpeg.writeFile('audio.mp3', audioData)
        audioArgs = ['-i', 'audio.mp3', '-shortest']
      }

      // Encode H.264
      await ffmpeg.exec([
        '-framerate', String(FPS),
        '-i', 'frame%06d.jpg',
        ...audioArgs,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-preset', 'ultrafast',
        '-crf', '23',
        '-movflags', '+faststart',
        'output.mp4',
      ])

      // Read output
      const outputData = await ffmpeg.readFile('output.mp4')
      const url = URL.createObjectURL(
        new Blob([outputData.buffer], { type: 'video/mp4' })
      )

      store.setExportState('done')
      store.setExportProgress(1)

      // Cleanup
      for (let i = 0; i < totalFrames; i++) {
        try { await ffmpeg.deleteFile(`frame${String(i).padStart(6, '0')}.jpg`) } catch (e) { /* */ }
      }
      if (soundtrack) {
        try { await ffmpeg.deleteFile('audio.mp3') } catch (e) { /* */ }
      }
      try { await ffmpeg.deleteFile('output.mp4') } catch (e) { /* */ }

      for (const entry of videoEntries) {
        if (entry._exportVideoEl) {
          entry._exportVideoEl.pause()
          entry._exportVideoEl.src = ''
          delete entry._exportVideoEl
        }
      }

      return url
    } catch (err) {
      console.error('Export failed:', err)
      store.setExportState('error')
      return null
    }
  }, [])

  return { exportVideo }
}
