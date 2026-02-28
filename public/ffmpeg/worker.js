// FFmpeg.wasm worker — classic worker that uses importScripts for UMD core
let ffmpeg = null

self.onmessage = async ({ data: msg }) => {
  const { type, id } = msg

  try {
    if (type === 'load') {
      const { coreURL, wasmURL } = msg
      importScripts(coreURL)
      ffmpeg = await self.createFFmpegCore({
        mainScriptUrlOrBlob: `${coreURL}#${btoa(JSON.stringify({ wasmURL, workerURL: '' }))}`,
      })
      ffmpeg.setLogger((data) => self.postMessage({ type: 'log', data }))
      ffmpeg.setProgress((data) => self.postMessage({ type: 'progress', data }))
      self.postMessage({ type: 'loaded', id })
    } else if (type === 'exec') {
      ffmpeg.setTimeout(-1)
      ffmpeg.exec(...msg.args)
      const ret = ffmpeg.ret
      ffmpeg.reset()
      self.postMessage({ type: 'exec-done', id, data: ret })
    } else if (type === 'writeFile') {
      const path = '' + msg.path
      const raw = msg.data
      // Reconstruct a fresh Uint8Array in this worker context
      // to ensure Emscripten's FS recognises it (ArrayBuffer.isView check)
      let buf
      if (raw instanceof ArrayBuffer) {
        buf = new Uint8Array(raw)
      } else if (raw instanceof Uint8Array) {
        buf = raw
      } else if (raw && raw.buffer instanceof ArrayBuffer) {
        buf = new Uint8Array(raw.buffer, raw.byteOffset || 0, raw.byteLength)
      } else {
        throw new Error('writeFile: unexpected data type: ' + typeof raw)
      }
      ffmpeg.FS.writeFile(path, buf)
      self.postMessage({ type: 'writeFile-done', id })
    } else if (type === 'readFile') {
      const path = '' + msg.path
      const result = ffmpeg.FS.readFile(path)
      self.postMessage({ type: 'readFile-done', id, data: result }, [result.buffer])
    } else if (type === 'deleteFile') {
      try { ffmpeg.FS.unlink('' + msg.path) } catch (e) { /* ignore */ }
      self.postMessage({ type: 'deleteFile-done', id })
    }
  } catch (err) {
    self.postMessage({ type: 'error', id, data: err.toString() })
  }
}
