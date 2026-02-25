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
  racing: {
    id: 'racing',
    name: 'y2k_racer',
    icon: '🛞',
    defaultSize: { w: 900, h: 650 },
    defaultPosition: { x: 60, y: 40 },
    resizable: true,
  },
}

export const DESKTOP_ICONS = [
  { appId: 'finder', label: 'Macintosh HD', icon: '💾' },
  { appId: 'browser', label: 'Safari', icon: '🧭' },
  { appId: 'textedit', label: 'TextEdit', icon: '📝' },
  { appId: 'racing', label: 'y2k_racer', icon: '🛞' },
]

export const DOCK_APPS = [
  { appId: 'finder', label: 'Finder', icon: '📁' },
  { appId: 'browser', label: 'Safari', icon: '🧭' },
  { appId: 'textedit', label: 'TextEdit', icon: '📝' },
  { appId: 'racing', label: 'y2k_racer', icon: '🛞' },
  { appId: 'about', label: 'About This Mac', icon: '🖥️' },
]

export const WINDOW_CONSTRAINTS = {
  minWidth: 300,
  minHeight: 200,
  menuBarHeight: 25,
  titleBarHeight: 22,
}
