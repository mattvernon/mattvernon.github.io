import { useState, useCallback } from 'react'
import useReelStore from '../store'
import useExporter from '../hooks/useExporter'

export default function ExportPanel() {
  const exportState = useReelStore((s) => s.exportState)
  const exportProgress = useReelStore((s) => s.exportProgress)
  const timeline = useReelStore((s) => s.timeline)
  const setExportState = useReelStore((s) => s.setExportState)
  const { exportVideo } = useExporter()
  const [downloadUrl, setDownloadUrl] = useState(null)

  const handleExport = useCallback(async () => {
    setDownloadUrl(null)
    const url = await exportVideo()
    if (url) setDownloadUrl(url)
  }, [exportVideo])

  const handleReset = useCallback(() => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    setDownloadUrl(null)
    setExportState('idle')
  }, [downloadUrl, setExportState])

  const isLoading = exportState === 'loading'
  const isEncoding = exportState === 'encoding'
  const isBusy = isLoading || isEncoding
  const isDone = exportState === 'done'
  const isError = exportState === 'error'

  return (
    <div className="rm-export-panel">
      <button
        className="rm-export-btn"
        onClick={isDone || isError ? handleReset : handleExport}
        disabled={isBusy || timeline.length === 0}
      >
        {isLoading ? 'Loading FFmpeg...' : isEncoding ? 'Encoding...' : isDone ? 'New Export' : isError ? 'Retry' : 'Export MP4'}
      </button>

      {isEncoding && (
        <div className="rm-export-progress">
          <div
            className="rm-export-progress-bar"
            style={{ width: `${Math.round(exportProgress * 100)}%` }}
          />
        </div>
      )}

      {isEncoding && (
        <span className="rm-time-display">{Math.round(exportProgress * 100)}%</span>
      )}

      {isDone && downloadUrl && (
        <a
          className="rm-export-download"
          href={downloadUrl}
          download="reel.mp4"
        >
          Download reel.mp4
        </a>
      )}

      {isError && (
        <span style={{ color: '#ff6666', fontSize: 12 }}>Export failed — check console</span>
      )}
    </div>
  )
}
