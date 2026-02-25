import useRacingStore from '../store'

export default function HUD() {
  const speed = useRacingStore((s) => s.speed)

  return (
    <div className="hud">
      <div className="hud-speed">
        <span className="hud-speed-value">{speed}</span>
        <span className="hud-speed-unit">KM/H</span>
      </div>
    </div>
  )
}
