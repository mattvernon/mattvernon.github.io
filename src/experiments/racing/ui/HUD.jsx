import Speedometer from './Speedometer'

export default function HUD() {
  return (
    <div className="hud">
      <img
        src="/y2kracer-logo.png"
        alt="y2k racer"
        className="hud-watermark"
      />
      <Speedometer />
    </div>
  )
}
