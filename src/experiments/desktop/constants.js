export const APPS = {
  finder: {
    id: 'finder',
    name: 'Finder',
    icon: '📁',
    defaultSize: { w: 600, h: 400 },
    defaultPosition: { x: 120, y: 80 },
    resizable: true,
  },
  textedit: {
    id: 'textedit',
    name: 'TextEdit',
    icon: '📝',
    defaultSize: { w: 500, h: 350 },
    defaultPosition: { x: 180, y: 120 },
    resizable: true,
  },
  browser: {
    id: 'browser',
    name: 'Safari',
    icon: '🧭',
    defaultSize: { w: 800, h: 550 },
    defaultPosition: { x: 80, y: 60 },
    resizable: true,
  },
  about: {
    id: 'about',
    name: 'About This Mac',
    icon: '',
    defaultSize: { w: 450, h: 300 },
    defaultPosition: { x: 240, y: 160 },
    resizable: false,
  },
  y2kracer: {
    id: 'y2kracer',
    name: 'y2k_racer',
    icon: '/y2kracer-icon.png',
    defaultSize: { w: 900, h: 650 },
    defaultPosition: { x: 60, y: 40 },
    resizable: true,
  },
  quicktime: {
    id: 'quicktime',
    name: 'QuickTime Player',
    icon: '/icons/mp4.png',
    defaultSize: { w: 640, h: 430 },
    defaultPosition: { x: 200, y: 100 },
    resizable: true,
  },
}

export const DESKTOP_ICONS = [
  { appId: 'finder', label: 'Macintosh HD', icon: '💾' },
  { appId: 'browser', label: 'Safari', icon: '🧭' },
  { appId: 'textedit', label: 'TextEdit', icon: '📝' },
  { appId: 'y2kracer', label: 'y2k_racer', icon: '/y2kracer-icon.png' },
  { appId: 'quicktime', label: 'Welcome', icon: '/icons/mp4.png' },
]

export const DOCK_APPS = [
  { appId: 'finder', label: 'Finder', icon: '📁' },
  { appId: 'browser', label: 'Safari', icon: '🧭' },
  { appId: 'textedit', label: 'TextEdit', icon: '📝' },
  { appId: 'y2kracer', label: 'y2k_racer', icon: '/y2kracer-icon.png' },
  { appId: 'quicktime', label: 'QuickTime Player', icon: '/icons/mp4.png' },
  { appId: 'about', label: 'About This Mac', icon: '🖥️' },
]

export const WINDOW_CONSTRAINTS = {
  minWidth: 300,
  minHeight: 200,
  menuBarHeight: 25,
  titleBarHeight: 22,
}
