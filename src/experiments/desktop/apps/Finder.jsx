import { useState } from 'react'

const SIDEBAR_ITEMS = [
  { icon: '💾', label: 'Macintosh HD' },
  { icon: '🖥️', label: 'Desktop' },
  { icon: '📄', label: 'Documents' },
  { icon: '⬇️', label: 'Downloads' },
  { icon: '🖼️', label: 'Pictures' },
  { icon: '🎵', label: 'Music' },
]

const FILES = [
  { name: 'Documents', kind: 'Folder', size: '--', icon: '📁' },
  { name: 'Downloads', kind: 'Folder', size: '--', icon: '📁' },
  { name: 'Pictures', kind: 'Folder', size: '--', icon: '📁' },
  { name: 'Music', kind: 'Folder', size: '--', icon: '📁' },
  { name: 'Resume.pdf', kind: 'PDF Document', size: '245 KB', icon: '📄' },
  { name: 'Notes.txt', kind: 'Text Document', size: '12 KB', icon: '📝' },
  { name: 'Photo.jpg', kind: 'JPEG Image', size: '1.2 MB', icon: '🖼️' },
]

export default function Finder() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedSidebar, setSelectedSidebar] = useState('Macintosh HD')

  return (
    <div className="finder">
      <div className="finder-sidebar">
        <div className="finder-section-title">Places</div>
        {SIDEBAR_ITEMS.map((item) => (
          <div
            key={item.label}
            className={`finder-item ${selectedSidebar === item.label ? 'selected' : ''}`}
            onClick={() => setSelectedSidebar(item.label)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <div className="finder-main">
        <div className="finder-toolbar">
          <button className="finder-nav-btn">◀</button>
          <button className="finder-nav-btn">▶</button>
          <span className="finder-path">{selectedSidebar}</span>
        </div>
        <div className="finder-file-list">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Kind</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>
              {FILES.map((file) => (
                <tr
                  key={file.name}
                  className={selectedFile === file.name ? 'selected' : ''}
                  onClick={() => setSelectedFile(file.name)}
                >
                  <td>{file.icon} {file.name}</td>
                  <td>{file.kind}</td>
                  <td>{file.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="finder-status">{FILES.length} items</div>
      </div>
    </div>
  )
}
