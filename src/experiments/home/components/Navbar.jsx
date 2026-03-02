import { useState, useEffect } from 'react'
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

const ACTIVE_MAP = {
  '/': 'home',
  '/about': 'about',
  '/experiments': 'experiments',
}

export default function Navbar({ variant = 'home' }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const activePage = ACTIVE_MAP[location.pathname] || 'home'

  useEffect(() => {
    const videos = document.querySelectorAll('video')
    if (open) {
      videos.forEach((v) => v.pause())
    } else {
      videos.forEach((v) => v.play())
    }
  }, [open])

  return (
    <>
      <nav className={`hm-navbar hm-navbar--${variant}`}>
        <span className="hm-navbar-title">matthewvernon.co</span>
        <button
          className={`hm-navbar-hamburger${open ? ' hm-navbar-hamburger--open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
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
