import useDesktopStore from '../store'

export default function DesktopIcon({ appId, icon, label }) {
  const openWindow = useDesktopStore((s) => s.openWindow)
  const selectedIconId = useDesktopStore((s) => s.selectedIconId)
  const selectIcon = useDesktopStore((s) => s.selectIcon)

  const isSelected = selectedIconId === appId

  const handleClick = (e) => {
    e.stopPropagation()
    selectIcon(appId)
  }

  const handleDoubleClick = () => {
    openWindow(appId)
  }

  return (
    <div
      className={`desktop-icon ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className="desktop-icon-image">
        {icon.startsWith('/') ? (
          <img src={icon} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '10px' }} />
        ) : (
          icon
        )}
      </div>
      <div className="desktop-icon-label">{label}</div>
    </div>
  )
}
