import useHomeStore from '../store'

export default function ColorPicker() {
  const setBgColor = useHomeStore((s) => s.setBgColor)

  const handleChange = (e) => {
    const hue = e.target.value
    setBgColor(`hsl(${hue}, 100%, 50%)`)
  }

  return (
    <div className="hm-colorpicker">
      <span className="hm-colorpicker-label">Choose Background Color</span>
      <input
        type="range"
        min="0"
        max="360"
        defaultValue="240"
        className="hm-colorpicker-slider"
        onChange={handleChange}
      />
    </div>
  )
}
