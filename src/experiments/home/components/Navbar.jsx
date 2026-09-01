import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'

const SOCIAL_LINKS = [
  { label: 'twitter', href: 'https://x.com/dApp_boi' },
  { label: 'instagram', href: 'https://www.instagram.com/matthewvernon' },
  { label: 'linkedin', href: 'https://www.linkedin.com/in/matthew-vernon-7394b597/' },
  { label: 'foundation', href: 'https://foundation.app/@matt' },
  { label: 'github', href: 'https://github.com/mattvernon' },
]

const NAV_LINKS = [
  { label: 'home', to: '/' },
  { label: 'about', to: '/about' },
  { label: 'experiments', to: '/experiments' },
]

// Design size of the hamburger bars, in CSS px
const HB_LINE = 2
const HB_GAP = 6

const ACTIVE_MAP = {
  '/': 'home',
  '/about': 'about',
  '/experiments': 'experiments',
}

export default function Navbar({ variant = 'home', onMenuOpen }) {
  const [open, setOpen] = useState(false)
  const hamburgerRef = useRef(null)
  const location = useLocation()
  const activePage = ACTIVE_MAP[location.pathname] || 'home'

  // The two hamburger bars only render at the same weight when each is a whole
  // number of device pixels tall AND both start on the device-pixel grid. At
  // non-integer browser zoom (90%, 110%) they otherwise land in different
  // subpixel phases and one gets antialiased into looking lighter than the
  // other. Snap the bar height, the gap, and the button's offset to the grid.
  useLayoutEffect(() => {
    const btn = hamburgerRef.current
    if (!btn) return

    const snap = () => {
      const dpr = window.devicePixelRatio || 1
      const toDevicePx = (v) => Math.max(1, Math.round(v * dpr)) / dpr
      btn.style.setProperty('--hb-line', `${toDevicePx(HB_LINE)}px`)
      btn.style.setProperty('--hb-gap', `${toDevicePx(HB_GAP)}px`)
      btn.style.transform = 'none'
      const top = btn.firstElementChild.getBoundingClientRect().top * dpr
      btn.style.transform = `translateY(${(Math.round(top) - top) / dpr}px)`
    }

    // Browser zoom changes devicePixelRatio; watch for it directly since not
    // every browser fires resize when only the zoom level changes.
    let mq
    const onZoom = () => {
      snap()
      watchZoom()
    }
    const watchZoom = () => {
      mq = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
      mq.addEventListener('change', onZoom, { once: true })
    }

    snap()
    watchZoom()
    window.addEventListener('resize', snap)
    return () => {
      window.removeEventListener('resize', snap)
      mq?.removeEventListener('change', onZoom)
    }
  }, [])

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    const prevThemeColor = meta?.getAttribute('content')
    const videos = document.querySelectorAll('video')
    if (open) {
      videos.forEach((v) => v.pause())
      // Set Safari chrome to dark to match the fullnav overlay
      if (meta) meta.setAttribute('content', '#0a0014')
    } else {
      videos.forEach((v) => v.play())
      // Restore the page's theme color
      if (meta && prevThemeColor) meta.setAttribute('content', prevThemeColor)
    }
  }, [open])

  return (
    <>
      <nav className={`hm-navbar hm-navbar--${variant}`}>
        <Link to="/" className="hm-navbar-title">matthewvernon.co</Link>
        <button
          ref={hamburgerRef}
          className={`hm-navbar-hamburger${open ? ' hm-navbar-hamburger--open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => {
            const opening = !open
            setOpen(opening)
            if (opening && onMenuOpen) onMenuOpen()
          }}
        >
          <span />
          <span />
        </button>
      </nav>

      <div className={`hm-fullnav hm-fullnav--${variant}${open ? ' hm-fullnav--open' : ''}`}>
        <div className="hm-fullnav-links">
          {NAV_LINKS.map((link) => {
            const isActive = link.label === activePage

            if (isActive || !link.to) {
              return (
                <span
                  key={link.label}
                  className={`hm-fullnav-link${isActive ? ' hm-fullnav-link--active' : ''}`}
                >
                  {link.label}
                </span>
              )
            }

            return (
              <Link
                key={link.label}
                to={link.to}
                className="hm-fullnav-link"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        <div className="hm-fullnav-socials">
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hm-fullnav-social"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
