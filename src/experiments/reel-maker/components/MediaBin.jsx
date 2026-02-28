import { useRef, useState, useCallback } from 'react'
import useReelStore from '../store'
import { decodeGif } from '../utils/gifDecoder'

let mediaIdCounter = 1

const ACCEPTED_TYPES = {
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/webp': 'image',
  'image/gif': 'gif',
  'video/mp4': 'video',
  'video/webm': 'video',
}

function generateThumbnail(source, width = 120, height = 120) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  const srcW = source.naturalWidth || source.videoWidth || source.width
  const srcH = source.naturalHeight || source.videoHeight || source.height
  const aspect = srcW / srcH
  let dw, dh, dx, dy
  if (aspect > 1) {
    dh = height
    dw = dh * aspect
    dx = (width - dw) / 2
    dy = 0
  } else {
    dw = width
    dh = dw / aspect
    dx = 0
    dy = (height - dh) / 2
  }
  ctx.fillStyle = '#333'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(source, dx, dy, dw, dh)

  return canvas.toDataURL('image/jpeg', 0.7)
}

async function processFile(file) {
  const mediaType = ACCEPTED_TYPES[file.type]
  if (!mediaType) return null

  const id = `media-${mediaIdCounter++}`
  const objectUrl = URL.createObjectURL(file)

  const entry = {
    id,
    name: file.name,
    type: mediaType,
    file,
    objectUrl,
    thumbnailUrl: null,
    naturalWidth: 0,
    naturalHeight: 0,
    duration: null,
    gifFrames: null,
    imageEl: null,
  }

  if (mediaType === 'image') {
    const img = new Image()
    img.src = objectUrl
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
    })
    entry.naturalWidth = img.naturalWidth
    entry.naturalHeight = img.naturalHeight
    entry.imageEl = img
    entry.thumbnailUrl = generateThumbnail(img)
  } else if (mediaType === 'gif') {
    const decoded = await decodeGif(file)
    entry.naturalWidth = decoded.width
    entry.naturalHeight = decoded.height
    entry.duration = decoded.totalDuration
    entry.gifFrames = decoded.frames
    if (decoded.frames.length > 0) {
      entry.thumbnailUrl = generateThumbnail(decoded.frames[0].canvas)
    }
  } else if (mediaType === 'video') {
    const video = document.createElement('video')
    video.src = objectUrl
    video.muted = true
    video.preload = 'auto'
    video.playsInline = true
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        entry.naturalWidth = video.videoWidth
        entry.naturalHeight = video.videoHeight
        entry.duration = video.duration
        video.currentTime = Math.min(1, video.duration / 2)
      }
      video.onseeked = () => {
        entry.thumbnailUrl = generateThumbnail(video)
        // Reset to start so it's ready for preview
        video.currentTime = 0
        resolve()
      }
      video.onerror = resolve
    })
    entry.videoEl = video
  }

  return entry
}

export default function MediaBin() {
  const media = useReelStore((s) => s.media)
  const addMedia = useReelStore((s) => s.addMedia)
  const removeMedia = useReelStore((s) => s.removeMedia)
  const addToTimeline = useReelStore((s) => s.addToTimeline)
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = useCallback(async (files) => {
    for (const file of files) {
      const entry = await processFile(file)
      if (entry) addMedia(entry)
    }
  }, [addMedia])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const onDragLeave = useCallback(() => {
    setDragging(false)
  }, [])

  const mediaList = Object.values(media)

  return (
    <div className="rm-media-bin">
      <div
        className={`rm-drop-zone ${dragging ? 'dragging' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        Drop media here
        <br />or click to browse
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="rm-media-grid">
        {mediaList.map((m) => (
          <div key={m.id} className="rm-media-thumb">
            {m.thumbnailUrl && <img src={m.thumbnailUrl} alt={m.name} />}
            <span className="rm-thumb-type">{m.type}</span>
            <button
              className="rm-thumb-remove"
              onClick={(e) => { e.stopPropagation(); removeMedia(m.id) }}
            >
              ×
            </button>
            <button
              className="rm-thumb-add"
              onClick={(e) => { e.stopPropagation(); addToTimeline(m.id) }}
            >
              +
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
