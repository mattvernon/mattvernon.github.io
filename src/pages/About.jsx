import { useEffect, useState, useRef, useCallback } from 'react'
import Navbar from '../experiments/home/components/Navbar'
import './About.css'

/* ── SVG Icons ── */

function FoundationLabsLogo({ className }) {
  return (
    <svg className={className} viewBox="0 0 69 71" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50.1055 0C59.1119 0 66.413 7.30116 66.4131 16.3076C66.4131 25.3141 59.112 32.6152 50.1055 32.6152C41.6357 32.6152 34.6746 26.1584 33.875 17.8984H45.9453V15.0215H33.8486C34.5045 6.61629 41.5319 5.39727e-05 50.1055 0ZM33.7988 16.3916C33.7987 16.3637 33.7979 16.3356 33.7979 16.3076C33.7979 16.2793 33.7987 16.251 33.7988 16.2227V16.3916Z" fill="currentColor"/>
      <path d="M56.1719 47.5791L53.6953 50.0557L55.1943 51.5547L58.3037 48.4453H68.1641V58.0381H58.251L55.1963 54.9834L53.6973 56.4824L56.1719 58.957V70.0283H46.5791V59.3379L49.4395 56.4775L47.9404 54.9785L44.8809 58.0381H34.5889V48.4453H44.6055L47.71 51.5498L49.209 50.0508L46.5791 47.4209V36.4531H56.1719V47.5791Z" fill="currentColor"/>
      <path d="M31.5527 42.2041V38.3672H31.5537V69.0645H17.5771V56.5742H14.7002V69.0645H0.856445V69.0625H4.69238L0.856445 65.2266V42.209L4.69336 38.3721H0.856445V38.3672H27.7158L31.5527 42.2041ZM27.7148 69.0635H31.5518V65.2266L27.7148 69.0635Z" fill="currentColor"/>
      <path d="M34.1016 26.5693L30.9873 31.7783H3.33398L0 26.4023L14.5098 1.27148H19.4961L34.1016 26.5693Z" fill="currentColor"/>
    </svg>
  )
}

function FoundationLabsLogoInline() {
  return (
    <svg className="about-inline-logo" viewBox="0 0 69 71" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50.1055 0C59.1119 0 66.413 7.30116 66.4131 16.3076C66.4131 25.3141 59.112 32.6152 50.1055 32.6152C41.6357 32.6152 34.6746 26.1584 33.875 17.8984H45.9453V15.0215H33.8486C34.5045 6.61629 41.5319 5.39727e-05 50.1055 0ZM33.7988 16.3916C33.7987 16.3637 33.7979 16.3356 33.7979 16.3076C33.7979 16.2793 33.7987 16.251 33.7988 16.2227V16.3916Z" fill="currentColor"/>
      <path d="M56.1719 47.5791L53.6953 50.0557L55.1943 51.5547L58.3037 48.4453H68.1641V58.0381H58.251L55.1963 54.9834L53.6973 56.4824L56.1719 58.957V70.0283H46.5791V59.3379L49.4395 56.4775L47.9404 54.9785L44.8809 58.0381H34.5889V48.4453H44.6055L47.71 51.5498L49.209 50.0508L46.5791 47.4209V36.4531H56.1719V47.5791Z" fill="currentColor"/>
      <path d="M31.5527 42.2041V38.3672H31.5537V69.0645H17.5771V56.5742H14.7002V69.0645H0.856445V69.0625H4.69238L0.856445 65.2266V42.209L4.69336 38.3721H0.856445V38.3672H27.7158L31.5527 42.2041ZM27.7148 69.0635H31.5518V65.2266L27.7148 69.0635Z" fill="currentColor"/>
      <path d="M34.1016 26.5693L30.9873 31.7783H3.33398L0 26.4023L14.5098 1.27148H19.4961L34.1016 26.5693Z" fill="currentColor"/>
    </svg>
  )
}

function FoundationLogo({ className }) {
  return (
    <svg className={className} viewBox="0 0 72 29" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34.9584 2.26367C41.5193 2.26391 46.8382 7.58261 46.8382 14.1436C46.8382 20.7046 41.5193 26.0232 34.9584 26.0234C28.3972 26.0234 23.0775 20.7047 23.0775 14.1436C23.0776 7.58247 28.3972 2.26367 34.9584 2.26367ZM69.6097 2.97266C70.2345 2.97266 70.7414 3.4788 70.7416 4.10352V24.1865C70.7416 24.8114 70.2346 25.3184 69.6097 25.3184H49.5267C48.902 25.3182 48.3959 24.8113 48.3959 24.1865V4.10352C48.396 3.4789 48.9021 2.97281 49.5267 2.97266H69.6097ZM12.2025 3.39355C12.4202 3.01646 12.9642 3.01655 13.182 3.39355L25.308 24.3955C25.5257 24.7727 25.2532 25.2441 24.8177 25.2441H0.566749C0.131392 25.244 -0.141091 24.7726 0.0765151 24.3955L12.2025 3.39355Z" fill="currentColor"/>
    </svg>
  )
}

function RodeoLogo({ className }) {
  return (
    <svg className={className} viewBox="0 0 59 59" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M29.5 4.89513e-10C27.3916 -1.87182e-06 25.6824 1.70922 25.6824 3.81765L25.6823 13.3975L26.8304 16.7066C26.9259 19.1118 23.9746 20.3343 22.3414 18.566L20.8134 15.4144L14.0393 8.64034C12.5484 7.14944 10.1312 7.14945 8.64032 8.64034C7.14944 10.1312 7.14942 12.5484 8.64032 14.0393L15.4144 20.8134L18.5659 22.3414C20.3342 23.9745 19.1117 26.9259 16.7066 26.8304L13.3975 25.6823L3.81765 25.6823C1.70922 25.6823 -3.74423e-06 27.3916 3.93778e-10 29.5C-2.99566e-05 31.6084 1.7092 33.3176 3.81763 33.3176H13.3975L16.7066 32.1696C19.1117 32.0741 20.3342 35.0254 18.566 36.6586L15.4143 38.1867L8.64032 44.9607C7.14943 46.4516 7.14942 48.8687 8.64032 50.3596C10.1312 51.8505 12.5484 51.8505 14.0393 50.3596L20.8133 43.5857L22.3413 40.434C23.9745 38.6657 26.9259 39.8882 26.8303 42.2934L25.6823 45.6023L25.6823 55.1823C25.6823 57.2908 27.3916 59 29.5 59C31.6084 59 33.3176 57.2908 33.3176 55.1824L33.3176 45.6024L32.1696 42.2934C32.074 39.8882 35.0254 38.6657 36.6586 40.434L38.1866 43.5856L44.9607 50.3596C46.4515 51.8505 48.8687 51.8505 50.3596 50.3596C51.8505 48.8688 51.8505 46.4515 50.3596 44.9607L43.5856 38.1867L40.434 36.6586C38.6657 35.0254 39.8882 32.0741 42.2933 32.1696L45.6024 33.3176L55.1824 33.3176C57.2908 33.3176 59 31.6084 59 29.5C59 28.4363 58.565 27.4742 57.8631 26.7819L32.218 1.13683C31.5258 0.435017 30.5637 -1.68503e-05 29.5 4.89513e-10ZM35.7826 13.6959C35.0607 12.974 33.8516 13.1275 33.333 14.0068L31.864 16.4977C31.6533 16.855 31.5934 17.2815 31.6975 17.683L33.2723 23.7574C33.5253 24.7332 34.2873 25.4952 35.2631 25.7482L41.3375 27.323C41.739 27.4271 42.1655 27.3672 42.5228 27.1565L45.0137 25.6876C45.8931 25.1689 46.0465 23.9599 45.3246 23.238L35.7826 13.6959Z" fill="currentColor"/>
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 0C10.0587 4.32464e-06 10.116 0.00593061 10.1719 0.015625C10.212 0.022591 10.2519 0.0310963 10.291 0.0429688C10.3401 0.0578823 10.387 0.077667 10.4326 0.0996094C10.4741 0.119559 10.5147 0.141955 10.5537 0.167969C10.6653 0.242368 10.7611 0.338248 10.835 0.450195C10.8801 0.518619 10.9148 0.591698 10.9414 0.666992C10.9461 0.680367 10.9519 0.693402 10.9561 0.707031C10.9623 0.727316 10.9668 0.747987 10.9717 0.768555C10.9893 0.842931 11 0.920226 11 1V8C11 8.55226 10.5523 8.99996 10 9C9.44772 9 9 8.55228 9 8V3.41406L1.70703 10.707C1.31652 11.0975 0.683496 11.0975 0.292969 10.707C-0.0975556 10.3165 -0.0975556 9.68349 0.292969 9.29297L7.58594 2H3C2.44772 2 2 1.55228 2 1C2 0.447715 2.44772 0 3 0H10Z" fill="currentColor"/>
    </svg>
  )
}

/* ── About Artifact Card (draggable photo) ── */

const IS_DEV = typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

const ABOUT_ARTIFACTS = [
  { filename: 'semipermanent.JPG', type: 'image', style: { top: '52px', left: 'calc(50% - 601px)', width: '293px' } },
  { filename: 'MONA.JPG', type: 'image', style: { top: '170px', left: 'calc(50% + 309px)', width: '314px' } },
  { filename: 'publichotel.jpg', type: 'image', style: { top: '346px', left: 'calc(50% - 825px)', width: '343px' } },
  { filename: 'semipermanent_02.jpg', type: 'image', style: { top: '885px', left: 'calc(50% - 603px)', width: '314px' } },
  { filename: 'NYC_blizzard.mp4', type: 'video', style: { top: '543px', left: 'calc(50% + 406px)', width: '335px' } },
]

// Module-level state so the layout editor can read all cards
const aboutLayoutState = {}

function getTypeLabel(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  if (ext === 'mp4' || ext === 'webm' || ext === 'mov') return 'Video'
  if (ext === 'gif') return 'GIF'
  return 'Image'
}

function AboutArtifactCard({ artifact }) {
  const cardRef = useRef(null)
  const [offset, setOffset] = useState({ dx: 0, dy: 0 })
  const [widthOverride, setWidthOverride] = useState(null)
  const [zIndex, setZIndex] = useState(1)
  const isDragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const startOffset = useRef({ dx: 0, dy: 0 })

  const typeLabel = getTypeLabel(artifact.filename)
  const src = `/about-photos/${artifact.filename}`

  // Sync to module-level state for export
  useEffect(() => {
    aboutLayoutState[artifact.filename] = { dx: offset.dx, dy: offset.dy, widthOverride }
  }, [offset, widthOverride, artifact.filename])

  const handlePointerDown = useCallback((e) => {
    if (e.target.closest('.about-artifact-resize-handle')) return
    isDragging.current = false
    startPos.current = { x: e.clientX, y: e.clientY }
    startOffset.current = { dx: offset.dx, dy: offset.dy }

    const handlePointerMove = (e) => {
      const dx = e.clientX - startPos.current.x
      const dy = e.clientY - startPos.current.y
      if (!isDragging.current && Math.abs(dx) + Math.abs(dy) > 4) {
        isDragging.current = true
        setZIndex(Date.now() % 100000)
      }
      if (isDragging.current) {
        setOffset({
          dx: startOffset.current.dx + dx,
          dy: startOffset.current.dy + dy,
        })
      }
    }

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }, [offset.dx, offset.dy])

  const handleResizeDown = useCallback((e) => {
    e.stopPropagation()
    const startX = e.clientX
    const startWidth = cardRef.current?.offsetWidth || 200
    setZIndex(Date.now() % 100000)

    const handleResizeMove = (e) => {
      const delta = e.clientX - startX
      setWidthOverride(Math.max(120, startWidth + delta))
    }

    const handleResizeUp = () => {
      window.removeEventListener('pointermove', handleResizeMove)
      window.removeEventListener('pointerup', handleResizeUp)
    }

    window.addEventListener('pointermove', handleResizeMove)
    window.addEventListener('pointerup', handleResizeUp)
  }, [])

  const widthStyle = widthOverride
    ? { width: `${widthOverride}px`, minWidth: 'unset', maxWidth: 'unset' }
    : {}

  return (
    <div
      className="about-artifact-card"
      ref={cardRef}
      data-artifact={artifact.filename}
      style={{
        ...artifact.style,
        ...widthStyle,
        transform: `translate(${offset.dx}px, ${offset.dy}px)`,
        zIndex,
      }}
      onPointerDown={handlePointerDown}
    >
      <div className="about-artifact-header">
        <span className="about-artifact-filename">{artifact.filename}</span>
        <span className="about-artifact-type-pill">{typeLabel}</span>
      </div>
      <div className="about-artifact-body">
        {artifact.type === 'video' ? (
          <video src={src} autoPlay loop muted playsInline className="about-artifact-media" draggable={false} />
        ) : (
          <img src={src} alt={artifact.filename} loading="lazy" className="about-artifact-media" draggable={false} />
        )}
      </div>
      {IS_DEV && (
        <div className="about-artifact-resize-handle" onPointerDown={handleResizeDown} />
      )}
    </div>
  )
}

/* ── Layout Editor (dev only) ── */

function AboutLayoutEditor() {
  if (!IS_DEV) return null

  const handleCopy = useCallback(() => {
    const container = document.querySelector('.about-artifacts')
    if (!container) return

    const scrollEl = document.querySelector('.about-page')
    const scrollTop = scrollEl ? scrollEl.scrollTop : 0
    const containerRect = container.getBoundingClientRect()
    const pageWidth = container.offsetWidth

    const layout = ABOUT_ARTIFACTS.map((artifact) => {
      const state = aboutLayoutState[artifact.filename] || { dx: 0, dy: 0, widthOverride: null }
      const card = container.querySelector(`[data-artifact="${artifact.filename}"]`)

      if (!card) return { filename: artifact.filename, type: artifact.type, style: artifact.style }

      const rect = card.getBoundingClientRect()
      const top = Math.round(rect.top - containerRect.top + scrollTop)
      const left = Math.round(rect.left - containerRect.left)
      const width = Math.round(rect.width)

      // Decide left vs right based on which side of center the card is
      const center = pageWidth / 2
      const cardCenter = left + width / 2
      const usesRight = cardCenter > center

      const style = usesRight
        ? { top: `${top}px`, right: `${Math.round(pageWidth - left - width)}px`, width: `${width}px` }
        : { top: `${top}px`, left: `${left}px`, width: `${width}px` }

      return { filename: artifact.filename, type: artifact.type, style }
    })

    const json = JSON.stringify(layout, null, 2)
    navigator.clipboard.writeText(json).then(() => {
      alert('Layout copied to clipboard!')
    })
    console.log('--- ABOUT LAYOUT ---')
    console.log(json)
  }, [])

  const handleReset = useCallback(() => {
    window.location.reload()
  }, [])

  return (
    <div className="about-layout-editor">
      <button className="about-layout-editor-btn" onClick={handleCopy}>Copy Layout</button>
      <button className="about-layout-editor-btn about-layout-editor-btn--reset" onClick={handleReset}>Reset</button>
    </div>
  )
}

/* ── Product Card ── */

function ProductCard({ variant, logo, url, urlLabel, name, description }) {
  return (
    <a
      href={`https://${url}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`about-product-card about-product-card--${variant}`}
    >
      <div className="about-product-card-top">
        <div className="about-product-card-logo">{logo}</div>
        <span className="about-product-card-link">
          {urlLabel} <ExternalLinkIcon />
        </span>
      </div>
      <div className="about-product-card-bottom">
        <h3 className="about-product-card-name">{name}</h3>
        <p className="about-product-card-desc">{description}</p>
      </div>
    </a>
  )
}

/* ── Main About Page ── */

export default function About() {
  const pageRef = useRef(null)

  useEffect(() => {
    document.title = 'About \u2014 Matthew Vernon'
    document.body.style.backgroundColor = '#fff'
    document.documentElement.style.backgroundColor = '#fff'
    document.body.style.margin = '0'
    document.body.style.overflow = ''
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', '#fff')
    // Scroll to top on mount
    if (pageRef.current) pageRef.current.scrollTop = 0
    window.scrollTo(0, 0)
    return () => {
      document.body.style.backgroundColor = ''
      document.documentElement.style.backgroundColor = ''
    }
  }, [])

  const [copied, setCopied] = useState(false)

  return (
    <div className="about-page" ref={pageRef}>
      <Navbar variant="about" />
      <AboutLayoutEditor />

      {/* Draggable photo artifacts (desktop only) */}
      <div className="about-artifacts">
        {ABOUT_ARTIFACTS.map((artifact) => (
          <AboutArtifactCard key={artifact.filename} artifact={artifact} />
        ))}
      </div>

      <main className="about-content">
        <h1 className="about-title">/about</h1>

        {/* ── INTRO ── */}
        <section className="about-section">
          <span className="about-section-label">Intro</span>

          <div className="about-body">
            <p>
              Hi, I&rsquo;m Matthew Vernon &mdash; a founder,
              product designer &amp; creative director.
            </p>
            <p>
              I was born in Sydney, Australia and
              currently based in Brooklyn, NY.
            </p>
            <p>
              For the past 6 years, I&rsquo;ve been a
              cofounder at Foundation Labs (<FoundationLabsLogoInline />),
              a technology company building software
              for creativity, culture and commerce.
            </p>
          </div>

          <ProductCard
            variant="green"
            logo={<FoundationLabsLogo className="about-product-logo about-product-logo--labs" />}
            url="foundation-labs.xyz"
            urlLabel="foundation-labs.xyz"
            name="Foundation Labs"
            description="2020&mdash;2026"
          />
        </section>

        {/* ── FOUNDATION ── */}
        <section className="about-section">
          <span className="about-section-label">Foundation</span>

          <div className="about-body">
            <p>
              In 2021, we launched Foundation &mdash; a
              digital art marketplace, that allowed
              hundreds of thousands of creators to
              dive into the chaotic world of NFTs.
            </p>
            <p>
              Over the years, Foundation has sold
              over $230 million of digital artwork for
              creators, and used by people like Charli
              XCX, Aphex Twin, Flume, The Hundreds,
              Jenny Holzer, Jen Stark, Jimmy Edgar,
              The New York Times, M.I.A., Rafael
              Rozendaal, Austin Lee and countless
              others.
            </p>
          </div>

          <ProductCard
            variant="dark"
            logo={<FoundationLogo className="about-product-logo about-product-logo--fnd" />}
            url="foundation.app"
            urlLabel="foundation.app"
            name="Foundation"
            description="The premier digital art marketplace."
          />

          <div className="about-body">
            <p>
              Our work with Foundation has been
              featured in virtually every publication
              across the internet.
            </p>
          </div>
        </section>

        {/* ── RODEO ── */}
        <section className="about-section">
          <span className="about-section-label">Rodeo</span>

          <div className="about-body">
            <p>
              In 2024, after navigating the shifts of the
              NFT industry &mdash; we realised experimental
              artists on the fringes were still flocking
              to Foundation for one thing, community.
            </p>
            <p>
              With this in mind, we launched Rodeo &mdash;
              a new kind of social network that
              allowed experimental creators (often
              working in the fields of Generative AI
              and creative coding) could share their
              work, expose their process, and support
              one another.
            </p>
            <p>
              At its peak Rodeo attracted a userbase
              of over 20,000 daily active users.
            </p>
          </div>

          <ProductCard
            variant="white"
            logo={<RodeoLogo className="about-product-logo about-product-logo--rodeo" />}
            url="foundation-labs.xyz/rodeo"
            urlLabel="foundation-labs.xyz/rodeo"
            name="Rodeo"
            description={<>Your social sketchbook.<br />Create. Share. Collect. Own.</>}
          />
        </section>

        {/* ── EARLIER ── */}
        <section className="about-section">
          <span className="about-section-label">Earlier</span>

          <div className="about-body">
            <p>
              Earlier in my career, I led design at a YC-backed
              crypto startup, Dharma. It was
              later acquired by OpenSea.
            </p>
            <p>
              Back in Sydney, I also ran my own
              freelance design business for 3 years,
              working with over 50 domestic and
              international clients.
            </p>
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section className="about-section">
          <span className="about-section-label">Contact</span>

          <div className="about-body">
            <p>
              For the first time in over a decade, I&rsquo;m
              actively exploring new roles &mdash; if you&rsquo;d
              like to get in touch, please email me.
            </p>
          </div>

          <div className="about-email">
            <a href="mailto:hello@matthewvernon.co">hello@matthewvernon.co</a>
            <button
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText('hello@matthewvernon.co')
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <a
            href="/Matthew_Vernon_CV.pdf"
            download
            className="about-cv-btn"
          >
            <span className="about-cv-icon">
              <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
                <path d="M6 1V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 10L6 15L11 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Download my CV
          </a>

          <nav className="about-socials">
            <a href="https://x.com/dApp_boi" target="_blank" rel="noopener noreferrer">twitter</a>
            <a href="https://www.instagram.com/matthewvernon" target="_blank" rel="noopener noreferrer">instagram</a>
            <a href="https://www.linkedin.com/in/matthew-vernon-7394b597/" target="_blank" rel="noopener noreferrer">linkedin</a>
            <a href="https://foundation.app/@matt" target="_blank" rel="noopener noreferrer">foundation</a>
            <a href="https://github.com/mattvernon" target="_blank" rel="noopener noreferrer">github</a>
          </nav>
        </section>
      </main>
    </div>
  )
}
