import { useCallback, useRef } from 'react'
import dpadSvg from './assets/DPad.svg'
import aBtnSvg from './assets/A_button.svg'
import bBtnSvg from './assets/B_button.svg'
import selectSvg from './assets/Select.svg'
import startSvg from './assets/Start.svg'

// GameBoy button indices: Right=0, Left=1, Up=2, Down=3, A=4, B=5, Select=6, Start=7

function useButton(index) {
  const activeRef = useRef(false)

  const press = useCallback(
    (e) => {
      e.preventDefault()
      if (!activeRef.current && window.gameboy) {
        activeRef.current = true
        window.gameboy.JoyPadEvent(index, true)
      }
    },
    [index],
  )

  const release = useCallback(
    (e) => {
      e.preventDefault()
      if (activeRef.current && window.gameboy) {
        activeRef.current = false
        window.gameboy.JoyPadEvent(index, false)
      }
    },
    [index],
  )

  return {
    onTouchStart: press,
    onTouchEnd: release,
    onTouchCancel: release,
    onMouseDown: press,
    onMouseUp: release,
    onMouseLeave: release,
  }
}

export default function GameBoyControls({ className }) {
  const up = useButton(2)
  const down = useButton(3)
  const left = useButton(1)
  const right = useButton(0)
  const a = useButton(4)
  const b = useButton(5)
  const select = useButton(6)
  const start = useButton(7)

  return (
    <div className={`${className} gb-controls`}>
      <div className="gb-ctrl-main">
        {/* D-Pad with triangular touch zones */}
        <div className="gb-ctrl-dpad">
          <img src={dpadSvg} alt="D-Pad" draggable={false} />
          <div className="gb-dpad-zone gb-dpad-up" {...up} />
          <div className="gb-dpad-zone gb-dpad-down" {...down} />
          <div className="gb-dpad-zone gb-dpad-left" {...left} />
          <div className="gb-dpad-zone gb-dpad-right" {...right} />
        </div>

        {/* A/B buttons in diagonal arrangement */}
        <div className="gb-ctrl-ab">
          <div className="gb-ctrl-btn" {...a}>
            <img src={aBtnSvg} alt="A" draggable={false} />
          </div>
          <div className="gb-ctrl-btn" {...b}>
            <img src={bBtnSvg} alt="B" draggable={false} />
          </div>
        </div>
      </div>

      <div className="gb-ctrl-meta">
        <div className="gb-ctrl-meta-btn" {...select}>
          <img src={selectSvg} alt="Select" draggable={false} />
        </div>
        <div className="gb-ctrl-meta-btn" {...start}>
          <img src={startSvg} alt="Start" draggable={false} />
        </div>
      </div>
    </div>
  )
}
