import { useState } from 'react'

const SECTIONS = [
  {
    title: 'SPIRAL LAYOUT',
    controls: [
      { key: 'density', label: 'Density', min: 5, max: 500, step: 1, type: 'range' },
      { key: 'spiralTightness', label: 'Tightness', min: 0.01, max: 1.0, step: 0.01, type: 'range' },
      { key: 'imageSpacing', label: 'Spacing', min: 0.05, max: 30, step: 0.05, type: 'range' },
      { key: 'maxTurns', label: 'Turns', min: 1, max: 20, step: 1, type: 'range' },
      { key: 'spiralRotation', label: 'Spiral Rotation', min: 0, max: 360, step: 1, type: 'range', suffix: '°' },
    ]
  },
  {
    title: 'IMAGE SIZE',
    controls: [
      { key: 'baseSize', label: 'Base Size', min: 0.1, max: 8, step: 0.05, type: 'range' },
      { key: 'sizeGrowth', label: 'Size Growth', min: 0, max: 1.0, step: 0.01, type: 'range' },
      { key: 'aspectRatio', label: 'Aspect Ratio', min: 0.2, max: 3, step: 0.05, type: 'range' },
      { key: 'borderRadius', label: 'Border Radius', min: 0, max: 0.5, step: 0.01, type: 'range', format: v => `${Math.round(v * 100)}%` },
    ]
  },
  {
    title: 'ROTATION',
    controls: [
      { key: 'imageRotation', label: 'Mode', type: 'select', options: ['tangent', 'fixed', 'random'] },
      { key: 'rotationOffset', label: 'Rotation Offset', min: 0, max: 360, step: 1, type: 'range', suffix: '°' },
    ]
  },
  {
    title: 'ANIMATION',
    controls: [
      { key: 'animationEnabled', label: 'Enabled', type: 'toggle' },
      { key: 'animationSpeed', label: 'Speed', min: 0, max: 5, step: 0.01, type: 'range' },
    ]
  },
  {
    title: 'FADING',
    controls: [
      { key: 'centerFade', label: 'Center Fade', min: 0, max: 1.0, step: 0.01, type: 'range' },
      { key: 'centerFadeSharpness', label: 'Center Sharpness', min: 0.1, max: 10, step: 0.1, type: 'range' },
      { key: 'edgeFade', label: 'Edge Fade', min: 0, max: 1, step: 0.01, type: 'range' },
      { key: 'edgeFadeSharpness', label: 'Edge Sharpness', min: 0.1, max: 10, step: 0.1, type: 'range' },
    ]
  },
  {
    title: 'CAMERA',
    controls: [
      { key: 'zoom', label: 'Zoom', min: 5, max: 200, step: 1, type: 'range' },
    ]
  },
  {
    title: 'VISUAL',
    controls: [
      { key: 'backgroundColor', label: 'Background', type: 'color' },
    ]
  },
]

function formatValue(control, value) {
  if (control.format) return control.format(value)
  if (control.suffix) return `${value}${control.suffix}`
  if (typeof value === 'number') {
    return Number.isInteger(control.step) ? value : value.toFixed(2)
  }
  return value
}

export default function ControlPanel({ settings, onChange, onRandomize, onReset }) {
  const [collapsed, setCollapsed] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState({})

  const toggleSection = (title) => {
    setCollapsedSections(prev => ({ ...prev, [title]: !prev[title] }))
  }

  if (collapsed) {
    return (
      <button className="cs-panel-toggle" onClick={() => setCollapsed(false)}>
        Show Controls
      </button>
    )
  }

  return (
    <div className="cs-panel">
      <div className="cs-panel-header">
        <span>Controls</span>
        <button className="cs-panel-close" onClick={() => setCollapsed(true)}>×</button>
      </div>
      <div className="cs-panel-scroll">
        {SECTIONS.map(section => (
          <div key={section.title} className="cs-section">
            <button
              className="cs-section-title"
              onClick={() => toggleSection(section.title)}
            >
              <span>{section.title}</span>
              <span className="cs-chevron">{collapsedSections[section.title] ? '▸' : '▾'}</span>
            </button>
            {!collapsedSections[section.title] && section.controls.map(control => (
              <div key={control.key} className="cs-control">
                <div className="cs-control-header">
                  <label>{control.label}</label>
                  <span className="cs-value">
                    {formatValue(control, settings[control.key])}
                  </span>
                </div>
                {control.type === 'range' && (
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={settings[control.key]}
                    onChange={e => onChange(control.key, parseFloat(e.target.value))}
                  />
                )}
                {control.type === 'select' && (
                  <div className="cs-select-group">
                    {control.options.map(opt => (
                      <button
                        key={opt}
                        className={`cs-select-btn ${settings[control.key] === opt ? 'active' : ''}`}
                        onClick={() => onChange(control.key, opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                {control.type === 'toggle' && (
                  <button
                    className={`cs-toggle ${settings[control.key] ? 'active' : ''}`}
                    onClick={() => onChange(control.key, !settings[control.key])}
                  >
                    {settings[control.key] ? 'ON' : 'OFF'}
                  </button>
                )}
                {control.type === 'color' && (
                  <input
                    type="color"
                    value={settings[control.key]}
                    onChange={e => onChange(control.key, e.target.value)}
                    className="cs-color-input"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="cs-panel-actions">
        <button className="cs-action-btn" onClick={onRandomize}>Randomize</button>
        <button className="cs-action-btn" onClick={onReset}>Reset</button>
      </div>
    </div>
  )
}
