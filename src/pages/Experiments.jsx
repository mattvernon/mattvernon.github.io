import { useEffect, useState, useCallback, useRef } from 'react'
import Navbar from '../experiments/home/components/Navbar'
import './Experiments.css'

const EXPERIMENTS = [
  {
    slug: 'mattOS',
    title: 'mattOS',
    description:
      'A macintosh-style desktop environment, built right into the browser, with a few fun apps.',
    color: '#1400FF',
  },
  {
    slug: 'y2kracer',
    title: 'y2k racer',
    description:
      'An arcade style street racing game built entirely in three.js, running in the browser. My ode to racing games like Need for Speed Underground, Midnight Club and Burnout.',
    color: '#E600FF',
  },
  {
    slug: 'reelmaker',
    title: 'reel maker',
    description:
      "A single use app I'm building to create social media assets based on a dump of screenshots, GIFs and videos. Still a WIP.",
    color: '#FFE600',
  },
  {
    slug: 'moodboard',
    title: 'moodboard',
    description:
      'An infinite canvas moodboard viewer powered by Cosmos. Enter any cosmos.so profile to explore their saves on a draggable, zoomable canvas.',
    color: '#FFCBA4',
  },
  {
    slug: 'dvd-screen',
    title: 'dvd screen',
    description:
      'The original homepage — a bouncing text box that drifts around the screen like a DVD screensaver, changing colors on click.',
    color: '#FF4500',
  },
  {
    slug: 'ioscart',
    title: 'iOS cart',
    description:
      'A pixel-perfect recreation of an iOS shopping cart screen, built in React. A sandbox for hacking on mobile design exercises.',
    color: '#8ACE00',
  },
]

export default function Experiments() {
  const [activeExp, setActiveExp] = useState(null)
  const [closing, setClosing] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)

  const closeModal = useCallback(() => {
    if (!activeExp || closing) return
    setClosing(true)
    setTimeout(() => {
      setActiveExp(null)
      setClosing(false)
    }, 250)
  }, [activeExp, closing])

  const pageRef = useRef(null)

  useEffect(() => {
    document.title = 'Experiments — Matthew Vernon'
    document.body.style.backgroundColor = '#000'
    document.documentElement.style.backgroundColor = '#000'
    document.body.style.margin = '0'
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', '#000')
    // Scroll to top on mount
    if (pageRef.current) pageRef.current.scrollTop = 0
    window.scrollTo(0, 0)
    return () => {
      document.body.style.backgroundColor = ''
      document.documentElement.style.backgroundColor = ''
    }
  }, [])

  useEffect(() => {
    if (activeExp) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [activeExp])

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && activeExp) closeModal()
    },
    [activeExp, closeModal],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="exp-page" ref={pageRef}>
      <Navbar variant="experiments" onMenuOpen={() => { setActiveExp(null); setClosing(false) }} />

      <main className="exp-content">
        <h1 className="exp-title">/experiments</h1>
        <p className="exp-subtitle">
          I've been having fun building experiments on
          <br />
          this website via Claude Code.
        </p>

        <div className="exp-cards">
          {EXPERIMENTS.map((exp) => (
            <div
              key={exp.slug}
              className={`exp-card${exp.color === '#FFE600' || exp.color === '#8ACE00' || exp.color === '#FFCBA4' ? ' exp-card--dark' : ''}${exp.color === '#08080c' ? ' exp-card--bordered' : ''}`}
              style={{ background: exp.color }}
              onClick={() => { setIframeLoaded(false); setActiveExp(exp) }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setIframeLoaded(false)
                  setActiveExp(exp)
                }
              }}
            >
              <div className="exp-card-header">
                <span className="exp-card-route">/{exp.slug}</span>
                <span className="exp-card-badge">Experiment</span>
              </div>
              <h3 className="exp-card-title">{exp.title}</h3>
              <p className="exp-card-desc">{exp.description}</p>
            </div>
          ))}
        </div>
      </main>

      {activeExp && (
        <div className={`exp-modal-overlay${closing ? ' exp-modal-overlay--closing' : ''}`} onClick={closeModal}>
          <div className={`exp-modal${closing ? ' exp-modal--closing' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="exp-modal-toolbar">
              <span
                className={`exp-modal-title${activeExp.color === '#FFE600' ? ' exp-modal-title--dark' : ''}`}
                style={{ background: activeExp.color }}
              >
                {activeExp.title}
              </span>
              <a
                className="exp-modal-btn exp-modal-btn--open"
                href={`/experiments/${activeExp.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in New Tab
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
              <button
                className="exp-modal-btn exp-modal-btn--close"
                onClick={closeModal}
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="exp-modal-body">
              {!iframeLoaded && (
                <div className="exp-modal-loader">
                  <div className="exp-modal-spinner" />
                </div>
              )}
              <iframe
                src={`/experiments/${activeExp.slug}`}
                className={`exp-modal-iframe${iframeLoaded ? '' : ' exp-modal-iframe--hidden'}`}
                title={activeExp.title}
                onLoad={() => setIframeLoaded(true)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
