import useReelStore from '../store'

export default function OutputSettings() {
  const outputWidth = useReelStore((s) => s.outputWidth)
  const outputHeight = useReelStore((s) => s.outputHeight)
  const outputBg = useReelStore((s) => s.outputBg)
  const setOutputSize = useReelStore((s) => s.setOutputSize)
  const applyPreset = useReelStore((s) => s.applyPreset)
  const setOutputBg = useReelStore((s) => s.setOutputBg)

  return (
    <div className="rm-output-settings">
      <div className="rm-settings-row">
        <div className="rm-presets">
          <button
            className={outputWidth === 1080 && outputHeight === 1080 ? 'active' : ''}
            onClick={() => applyPreset('square')}
          >
            1:1
          </button>
          <button
            className={outputWidth === 1920 && outputHeight === 1080 ? 'active' : ''}
            onClick={() => applyPreset('landscape')}
          >
            16:9
          </button>
          <button
            className={outputWidth === 1080 && outputHeight === 1920 ? 'active' : ''}
            onClick={() => applyPreset('portrait')}
          >
            9:16
          </button>
        </div>

        <div className="rm-dimensions">
          <input
            type="number"
            value={outputWidth}
            onChange={(e) => setOutputSize(Number(e.target.value) || 1, outputHeight)}
            min={1}
            max={3840}
          />
          <span>×</span>
          <input
            type="number"
            value={outputHeight}
            onChange={(e) => setOutputSize(outputWidth, Number(e.target.value) || 1)}
            min={1}
            max={3840}
          />
        </div>

        <div className="rm-bg-color">
          <label>BG</label>
          <input
            type="color"
            value={outputBg}
            onChange={(e) => setOutputBg(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
