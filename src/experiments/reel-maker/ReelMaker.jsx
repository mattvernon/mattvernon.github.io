import { useEffect, useRef } from 'react'
import OutputSettings from './components/OutputSettings'
import MediaBin from './components/MediaBin'
import Timeline from './components/Timeline'
import CanvasPreview from './components/CanvasPreview'
import TransformControls from './components/TransformControls'
import SoundtrackPanel from './components/SoundtrackPanel'
import ExportPanel from './components/ExportPanel'
import './ReelMaker.css'

export default function ReelMaker() {
  const audioRef = useRef(new Audio())

  useEffect(() => {
    document.title = 'Reel Maker'
    document.body.style.margin = '0'
    document.body.style.overflow = 'hidden'
    document.body.style.background = '#1a1a1a'
    return () => {
      document.title = 'Matt Vernon'
      document.body.style.margin = ''
      document.body.style.overflow = ''
      document.body.style.background = ''
      audioRef.current.pause()
      audioRef.current.src = ''
    }
  }, [])

  return (
    <div className="rm-app">
      <div className="rm-topbar">
        <OutputSettings />
        <ExportPanel />
      </div>
      <div className="rm-main">
        <div className="rm-sidebar">
          <MediaBin />
        </div>
        <div className="rm-center">
          <CanvasPreview audioRef={audioRef} />
        </div>
        <div className="rm-right">
          <TransformControls />
        </div>
      </div>
      <div className="rm-bottom">
        <div className="rm-bottom-row">
          <SoundtrackPanel audioRef={audioRef} />
        </div>
        <Timeline />
      </div>
    </div>
  )
}
