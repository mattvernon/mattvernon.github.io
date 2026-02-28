import { parseGIF, decompressFrames } from 'gifuct-js'

export async function decodeGif(file) {
  const buffer = await file.arrayBuffer()
  const gif = parseGIF(buffer)
  const rawFrames = decompressFrames(gif, true)

  const { width, height } = gif.lsd
  const compCanvas = document.createElement('canvas')
  compCanvas.width = width
  compCanvas.height = height
  const compCtx = compCanvas.getContext('2d')

  const frames = []
  let cumulativeDelay = 0

  for (const raw of rawFrames) {
    const patchCanvas = document.createElement('canvas')
    patchCanvas.width = raw.dims.width
    patchCanvas.height = raw.dims.height
    const patchCtx = patchCanvas.getContext('2d')
    const imageData = patchCtx.createImageData(raw.dims.width, raw.dims.height)
    imageData.data.set(raw.patch)
    patchCtx.putImageData(imageData, 0, 0)

    compCtx.drawImage(patchCanvas, raw.dims.left, raw.dims.top)

    const snapshot = document.createElement('canvas')
    snapshot.width = width
    snapshot.height = height
    snapshot.getContext('2d').drawImage(compCanvas, 0, 0)

    const delay = (raw.delay || 100) / 1000
    frames.push({
      canvas: snapshot,
      delay,
      startTime: cumulativeDelay,
    })
    cumulativeDelay += delay

    if (raw.disposalType === 2) {
      compCtx.clearRect(raw.dims.left, raw.dims.top, raw.dims.width, raw.dims.height)
    }
  }

  return {
    width,
    height,
    totalDuration: cumulativeDelay,
    frames,
  }
}

export function getGifFrameIndex(frames, localTime) {
  if (!frames || frames.length === 0) return 0
  const totalDur = frames[frames.length - 1].startTime + frames[frames.length - 1].delay
  const wrapped = totalDur > 0 ? localTime % totalDur : 0

  for (let i = frames.length - 1; i >= 0; i--) {
    if (wrapped >= frames[i].startTime) return i
  }
  return 0
}
