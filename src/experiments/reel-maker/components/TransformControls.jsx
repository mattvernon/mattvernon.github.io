import useReelStore from '../store'
import { alignmentPreset } from '../utils/transforms'

export default function TransformControls() {
  const timeline = useReelStore((s) => s.timeline)
  const media = useReelStore((s) => s.media)
  const selectedItemId = useReelStore((s) => s.selectedItemId)
  const outputWidth = useReelStore((s) => s.outputWidth)
  const outputHeight = useReelStore((s) => s.outputHeight)
  const outputBg = useReelStore((s) => s.outputBg)
  const updateItem = useReelStore((s) => s.updateItem)
  const updateItemTransform = useReelStore((s) => s.updateItemTransform)
  const copiedTransform = useReelStore((s) => s.copiedTransform)
  const copyTransform = useReelStore((s) => s.copyTransform)
  const pasteTransform = useReelStore((s) => s.pasteTransform)
  const applyTransformToAll = useReelStore((s) => s.applyTransformToAll)

  const item = timeline.find((t) => t.id === selectedItemId)
  if (!item) {
    return <div className="rm-no-selection">Select an item on the timeline</div>
  }

  const mediaEntry = media[item.mediaId]
  const mw = mediaEntry?.naturalWidth || 1
  const mh = mediaEntry?.naturalHeight || 1

  const applyAlignment = (preset) => {
    const result = alignmentPreset(preset, mw, mh, outputWidth, outputHeight, item.transform.scale)
    if (result.scale !== undefined) {
      updateItemTransform(item.id, result)
    } else {
      updateItemTransform(item.id, result)
    }
  }

  return (
    <div className="rm-transform-controls">
      <div className="rm-transform-section">
        <label>Scale ({Math.round(item.transform.scale)}%)</label>
        <input
          type="range"
          min={10}
          max={200}
          value={item.transform.scale}
          onChange={(e) => updateItemTransform(item.id, { scale: Number(e.target.value) })}
        />
      </div>

      <div className="rm-transform-section">
        <label>Position</label>
        <div className="rm-transform-row">
          <span>X</span>
          <input
            type="number"
            value={Math.round(item.transform.x)}
            onChange={(e) => updateItemTransform(item.id, { x: Number(e.target.value) })}
          />
          <span>Y</span>
          <input
            type="number"
            value={Math.round(item.transform.y)}
            onChange={(e) => updateItemTransform(item.id, { y: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="rm-transform-section">
        <label>Align</label>
        <div className="rm-alignment-presets">
          <button onClick={() => applyAlignment('center')}>Center</button>
          <button onClick={() => applyAlignment('top')}>Top</button>
          <button onClick={() => applyAlignment('bottom')}>Bottom</button>
          <button onClick={() => applyAlignment('left')}>Left</button>
          <button onClick={() => applyAlignment('right')}>Right</button>
          <button onClick={() => applyAlignment('fill')}>Fill</button>
          <button onClick={() => applyAlignment('fit')}>Fit</button>
        </div>
      </div>

      <div className="rm-transform-section">
        <label>Timing</label>
        <div className="rm-transform-row">
          <span>Start</span>
          <input
            type="number"
            step={0.1}
            min={0}
            max={mediaEntry?.duration ? mediaEntry.duration - 0.1 : 999}
            value={item.startOffset || 0}
            onChange={(e) => updateItem(item.id, { startOffset: Math.max(0, Number(e.target.value)) })}
          />
          <span>Duration</span>
          <input
            type="number"
            step={0.1}
            min={0.1}
            max={30}
            value={item.duration}
            onChange={(e) => updateItem(item.id, { duration: Math.max(0.1, Number(e.target.value)) })}
          />
        </div>
      </div>

      <div className="rm-transform-section">
        <label>Background</label>
        <div className="rm-transform-row">
          <input
            type="color"
            value={item.background || outputBg}
            onChange={(e) => updateItem(item.id, { background: e.target.value })}
          />
          {item.background && (
            <button
              className="rm-alignment-presets"
              style={{ padding: '2px 6px', fontSize: '10px' }}
              onClick={() => updateItem(item.id, { background: null })}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="rm-transform-section">
        <label>Batch</label>
        <div className="rm-batch-controls">
          <button onClick={copyTransform}>Copy</button>
          <button
            disabled={!copiedTransform}
            onClick={() => pasteTransform(item.id)}
          >
            Paste
          </button>
          <button
            disabled={!copiedTransform}
            onClick={applyTransformToAll}
          >
            Apply All
          </button>
        </div>
      </div>
    </div>
  )
}
