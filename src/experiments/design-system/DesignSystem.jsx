import { useState } from 'react'
import '../../styles/ds.css'
import './DesignSystem.css'

const SAMPLE_TEXT = 'The quick brown fox jumps over the lazy dog'

const COLOR_SCALES = [
  { name: 'Primary', prefix: '--color-primary', steps: ['900','800','700','600','500','400','300','200','100','50'] },
  { name: 'Secondary', prefix: '--color-secondary', steps: ['900','800','700','600','500','400','300','200','100','50'] },
  { name: 'Accent', prefix: '--color-accent', steps: ['900','800','700','600','500','400','300','200','100','50'] },
  { name: 'Neutral', prefix: '--color-neutral', steps: ['950','900','800','700','600','500','400','300','200','100','50','0'] },
]

const SEMANTIC_COLORS = [
  { name: 'Success', prefix: '--color-success', steps: ['900','700','500','300','100'] },
  { name: 'Warning', prefix: '--color-warning', steps: ['900','700','500','300','100'] },
  { name: 'Error', prefix: '--color-error', steps: ['900','700','500','300','100'] },
  { name: 'Info', prefix: '--color-info', steps: ['900','700','500','300','100'] },
]

const TYPE_SCALE = [
  { token: '--font-size-6xl', label: '6xl' },
  { token: '--font-size-5xl', label: '5xl' },
  { token: '--font-size-4xl', label: '4xl' },
  { token: '--font-size-3xl', label: '3xl' },
  { token: '--font-size-2xl', label: '2xl' },
  { token: '--font-size-xl', label: 'xl' },
  { token: '--font-size-lg', label: 'lg' },
  { token: '--font-size-md', label: 'md' },
  { token: '--font-size-base', label: 'base' },
  { token: '--font-size-sm', label: 'sm' },
  { token: '--font-size-xs', label: 'xs' },
]

const SPACING = [
  { token: '--space-1', value: '2px' },
  { token: '--space-2', value: '4px' },
  { token: '--space-4', value: '8px' },
  { token: '--space-6', value: '12px' },
  { token: '--space-8', value: '16px' },
  { token: '--space-12', value: '24px' },
  { token: '--space-16', value: '32px' },
  { token: '--space-24', value: '48px' },
  { token: '--space-32', value: '64px' },
  { token: '--space-48', value: '96px' },
  { token: '--space-64', value: '128px' },
]

const RADII = [
  { token: '--radius-sm', label: 'sm', value: '4px' },
  { token: '--radius-base', label: 'base', value: '8px' },
  { token: '--radius-md', label: 'md', value: '12px' },
  { token: '--radius-lg', label: 'lg', value: '16px' },
  { token: '--radius-xl', label: 'xl', value: '24px' },
  { token: '--radius-2xl', label: '2xl', value: '32px' },
  { token: '--radius-pill', label: 'pill', value: '50rem' },
  { token: '--radius-full', label: 'full', value: '9999px' },
]

const SHADOWS = [
  { token: '--shadow-xs', label: 'xs' },
  { token: '--shadow-sm', label: 'sm' },
  { token: '--shadow-base', label: 'base' },
  { token: '--shadow-md', label: 'md' },
  { token: '--shadow-lg', label: 'lg' },
  { token: '--shadow-xl', label: 'xl' },
  { token: '--shadow-2xl', label: '2xl' },
]

const EASINGS = [
  { token: '--ease-in', label: 'ease-in' },
  { token: '--ease-out', label: 'ease-out' },
  { token: '--ease-in-out', label: 'ease-in-out' },
  { token: '--ease-bounce', label: 'bounce' },
  { token: '--ease-elastic', label: 'elastic' },
  { token: '--ease-smooth', label: 'smooth' },
]

const NAV_SECTIONS = [
  { id: 'colors', label: 'Colors' },
  { id: 'typography', label: 'Typography' },
  { id: 'spacing', label: 'Spacing' },
  { id: 'radius', label: 'Border Radius' },
  { id: 'shadows', label: 'Shadows' },
  { id: 'glass', label: 'Glass Effects' },
  { id: 'motion', label: 'Motion' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'inputs', label: 'Inputs' },
  { id: 'badges', label: 'Badges' },
  { id: 'surfaces', label: 'Surfaces' },
]

function ColorScale({ name, prefix, steps }) {
  return (
    <div className="ds-subsection">
      <div className="ds-subsection-title">{name}</div>
      <div className="ds-swatches">
        {steps.map(step => (
          <div key={step} className="ds-swatch">
            <div
              className="ds-swatch-color"
              style={{ background: `var(${prefix}-${step})` }}
            />
            <div className="ds-swatch-label">{step}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DesignSystem() {
  const [theme, setTheme] = useState('dark')

  const toggleTheme = () => {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="ds" data-theme={theme === 'light' ? 'light' : undefined}>
      {/* Header */}
      <header className="ds-header">
        <h1>Design System</h1>
        <div className="ds-header-actions">
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-family-mono)' }}>
            v1.0
          </span>
          <button className="btn btn-secondary btn-sm" onClick={toggleTheme}>
            {theme === 'dark' ? '☀ Light' : '● Dark'}
          </button>
        </div>
      </header>

      <div className="ds-body">
        {/* Sidebar Nav */}
        <nav className="ds-nav">
          <div className="ds-nav-group">
            <div className="ds-nav-group-label">Tokens</div>
            {NAV_SECTIONS.slice(0, 7).map(s => (
              <a key={s.id} href={`#${s.id}`}>{s.label}</a>
            ))}
          </div>
          <div className="ds-nav-group">
            <div className="ds-nav-group-label">Components</div>
            {NAV_SECTIONS.slice(7).map(s => (
              <a key={s.id} href={`#${s.id}`}>{s.label}</a>
            ))}
          </div>
        </nav>

        {/* Content */}
        <main className="ds-content">

          {/* ========== COLORS ========== */}
          <section id="colors" className="ds-section">
            <h2 className="ds-section-title">Colors</h2>
            <p className="ds-section-desc">
              A full-spectrum color system anchored by Electric Purple (#3300FF).
              Each scale runs 900–50 from darkest to lightest. Semantic colors
              provide consistent feedback states.
            </p>

            {COLOR_SCALES.map(scale => (
              <ColorScale key={scale.name} {...scale} />
            ))}

            <div className="ds-subsection">
              <div className="ds-subsection-title">Semantic</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-8)' }}>
                {SEMANTIC_COLORS.map(scale => (
                  <div key={scale.name}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>{scale.name}</div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      {scale.steps.map(step => (
                        <div key={step} style={{ flex: 1, height: 40, borderRadius: 'var(--radius-sm)', background: `var(${scale.prefix}-${step})` }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ds-subsection">
              <div className="ds-subsection-title">Glass Surfaces</div>
              <div className="ds-glass-stage">
                {['100','200','300','400','500'].map(step => (
                  <div key={step} style={{
                    flex: '1',
                    minWidth: 80,
                    height: 80,
                    background: `var(--color-glass-${step})`,
                    backdropFilter: 'blur(var(--blur-xl))',
                    WebkitBackdropFilter: 'blur(var(--blur-xl))',
                    border: '1px solid var(--color-border-glass)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontFamily: 'var(--font-family-mono)',
                    color: 'var(--color-text-tertiary)',
                  }}>
                    glass-{step}
                  </div>
                ))}
              </div>
            </div>

            <div className="ds-code">{`/* Usage */
color: var(--color-primary-700);
background: var(--color-glass-300);
border-color: var(--color-border-glass);`}</div>
          </section>


          {/* ========== TYPOGRAPHY ========== */}
          <section id="typography" className="ds-section">
            <h2 className="ds-section-title">Typography</h2>
            <p className="ds-section-desc">
              Suisse Intl across all weights, with a fluid clamp()-based scale
              that adapts smoothly between mobile and desktop.
            </p>

            <div className="ds-subsection">
              <div className="ds-subsection-title">Type Scale</div>
              {TYPE_SCALE.map(({ token, label }) => (
                <div key={token} className="ds-type-row">
                  <span className="ds-type-label">{label}</span>
                  <span className="ds-type-sample" style={{ fontSize: `var(${token})` }}>
                    {SAMPLE_TEXT}
                  </span>
                </div>
              ))}
            </div>

            <div className="ds-subsection">
              <div className="ds-subsection-title">Weights</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {[
                  ['Thin', 100], ['Extralight', 200], ['Light', 300], ['Regular', 400],
                  ['Medium', 500], ['Semibold', 600], ['Bold', 700], ['Extrabold', 800], ['Black', 900],
                ].map(([name, weight]) => (
                  <div key={weight} className="ds-type-row">
                    <span className="ds-type-label">{weight}</span>
                    <span className="ds-type-sample" style={{ fontSize: 'var(--font-size-lg)', fontWeight: weight }}>
                      {name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ds-subsection">
              <div className="ds-subsection-title">Monospace</div>
              <div style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                const design = await wisp.run("generate tokens") // Suisse Intl Mono
              </div>
            </div>

            <div className="ds-code">{`font-family: var(--font-family-sans);
font-size: var(--font-size-lg);
font-weight: var(--font-weight-semibold);
line-height: var(--line-height-tight);
letter-spacing: var(--letter-spacing-tight);`}</div>
          </section>


          {/* ========== SPACING ========== */}
          <section id="spacing" className="ds-section">
            <h2 className="ds-section-title">Spacing</h2>
            <p className="ds-section-desc">
              An 8px base-unit scale from 2px to 256px. Use multiples of the base
              unit for consistent rhythm across all layouts.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {SPACING.map(({ token, value }) => (
                <div key={token} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                  <span className="ds-type-label" style={{ width: 100 }}>{token.replace('--', '')}</span>
                  <div className="ds-space-bar" style={{ width: `calc(${value} + 40px)` }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div className="ds-code">{`padding: var(--space-8) var(--space-12);
gap: var(--space-4);
margin-bottom: var(--space-16);`}</div>
          </section>


          {/* ========== RADIUS ========== */}
          <section id="radius" className="ds-section">
            <h2 className="ds-section-title">Border Radius</h2>
            <p className="ds-section-desc">
              From subtle rounding to full pills and circles.
            </p>

            <div className="ds-demo-row">
              {RADII.map(({ token, label }) => (
                <div key={token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div className="ds-radius-demo" style={{ borderRadius: `var(${token})` }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <div className="ds-code">{`border-radius: var(--radius-lg);   /* cards */
border-radius: var(--radius-pill);  /* buttons */
border-radius: var(--radius-full);  /* avatars */`}</div>
          </section>


          {/* ========== SHADOWS ========== */}
          <section id="shadows" className="ds-section">
            <h2 className="ds-section-title">Shadows</h2>
            <p className="ds-section-desc">
              Seven elevation levels plus glow effects for interactive states
              and glass surfaces.
            </p>

            <div className="ds-subsection">
              <div className="ds-subsection-title">Elevation</div>
              <div className="ds-demo-row">
                {SHADOWS.map(({ token, label }) => (
                  <div key={token} className="ds-shadow-demo" style={{ boxShadow: `var(${token})` }}>
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="ds-subsection">
              <div className="ds-subsection-title">Glow</div>
              <div className="ds-demo-row">
                <div className="ds-shadow-demo" style={{ boxShadow: 'var(--shadow-glow-primary)', background: 'var(--color-primary-700)' }}>
                  primary
                </div>
                <div className="ds-shadow-demo" style={{ boxShadow: 'var(--shadow-glow-accent)', background: 'var(--color-accent-700)' }}>
                  accent
                </div>
                <div className="ds-shadow-demo" style={{ boxShadow: 'var(--shadow-glass)' }}>
                  glass
                </div>
              </div>
            </div>

            <div className="ds-code">{`box-shadow: var(--shadow-md);
box-shadow: var(--shadow-glow-primary);  /* hover glow */
box-shadow: var(--shadow-glass);         /* glass cards */`}</div>
          </section>


          {/* ========== GLASS ========== */}
          <section id="glass" className="ds-section">
            <h2 className="ds-section-title">Glass Effects</h2>
            <p className="ds-section-desc">
              Ready-made glass surface classes with backdrop blur, transparency,
              and subtle borders. Drop these onto any container.
            </p>

            <div className="ds-glass-stage">
              <div className="ds-glass-card-demo glass-subtle">
                <h3>.glass-subtle</h3>
                <p>Minimal frosted surface for secondary containers.</p>
              </div>
              <div className="ds-glass-card-demo glass">
                <h3>.glass</h3>
                <p>Standard glass card — the workhorse surface.</p>
              </div>
              <div className="ds-glass-card-demo glass-prominent">
                <h3>.glass-prominent</h3>
                <p>High-blur, high-opacity for modals and overlays.</p>
              </div>
              <div className="ds-glass-card-demo glass-primary">
                <h3>.glass-primary</h3>
                <p>Brand-tinted glass for featured sections.</p>
              </div>
            </div>

            <div className="ds-code">{`<div class="glass">
  Standard glass card
</div>

<div class="glass-prominent">
  Modal overlay
</div>`}</div>
          </section>


          {/* ========== MOTION ========== */}
          <section id="motion" className="ds-section">
            <h2 className="ds-section-title">Motion</h2>
            <p className="ds-section-desc">
              Duration and easing tokens for consistent, purposeful animation.
              Hover the boxes below to see each easing in action.
            </p>

            <div className="ds-subsection">
              <div className="ds-subsection-title">Easings</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {EASINGS.map(({ token, label }) => (
                  <div key={token} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                    <span className="ds-type-label" style={{ width: 100 }}>{label}</span>
                    <div
                      className="ds-motion-demo"
                      style={{ transition: `transform 600ms var(${token})` }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(120px) scale(1.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0) scale(1)' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="ds-code">{`transition: all var(--transition-fast);
transition: transform var(--duration-normal) var(--ease-bounce);
transition: opacity var(--duration-fast) var(--ease-out);`}</div>
          </section>


          {/* ========== BUTTONS ========== */}
          <section id="buttons" className="ds-section">
            <h2 className="ds-section-title">Buttons</h2>
            <p className="ds-section-desc">
              Pill-shaped buttons in three variants and three sizes.
              All include scale-down on active for tactile feedback.
            </p>

            <div className="ds-subsection">
              <div className="ds-subsection-title">Variants</div>
              <div className="ds-demo-row">
                <button className="btn btn-primary">Primary</button>
                <button className="btn btn-secondary">Secondary</button>
                <button className="btn btn-ghost">Ghost</button>
              </div>
            </div>

            <div className="ds-subsection">
              <div className="ds-subsection-title">Sizes</div>
              <div className="ds-demo-row">
                <button className="btn btn-primary btn-sm">Small</button>
                <button className="btn btn-primary">Default</button>
                <button className="btn btn-primary btn-lg">Large</button>
              </div>
            </div>

            <div className="ds-subsection">
              <div className="ds-subsection-title">With Icons</div>
              <div className="ds-demo-row">
                <button className="btn btn-primary">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  Create
                </button>
                <button className="btn btn-icon btn-secondary">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </button>
              </div>
            </div>

            <div className="ds-code">{`<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary btn-sm">Small Secondary</button>
<button class="btn btn-ghost btn-lg">Large Ghost</button>
<button class="btn btn-icon btn-secondary">...</button>`}</div>
          </section>


          {/* ========== INPUTS ========== */}
          <section id="inputs" className="ds-section">
            <h2 className="ds-section-title">Inputs</h2>
            <p className="ds-section-desc">
              Clean, minimal inputs with focus rings that use the brand color.
            </p>

            <div className="ds-demo-col" style={{ maxWidth: 400 }}>
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>Default</div>
                <input className="input" placeholder="Enter something..." />
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }}>Glass variant</div>
                <div className="ds-glass-stage" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-md)' }}>
                  <input className="input input-glass" placeholder="Glass input..." style={{ flex: 1 }} />
                </div>
              </div>
            </div>

            <div className="ds-code">{`<input class="input" placeholder="Default input" />
<input class="input input-glass" placeholder="Glass variant" />`}</div>
          </section>


          {/* ========== BADGES ========== */}
          <section id="badges" className="ds-section">
            <h2 className="ds-section-title">Badges</h2>
            <p className="ds-section-desc">
              Lightweight status indicators for labels and metadata.
            </p>

            <div className="ds-demo-row">
              <span className="badge badge-primary">Primary</span>
              <span className="badge badge-success">Success</span>
              <span className="badge badge-warning">Warning</span>
              <span className="badge badge-error">Error</span>
            </div>

            <div className="ds-code">{`<span class="badge badge-primary">New</span>
<span class="badge badge-success">Active</span>
<span class="badge badge-error">Offline</span>`}</div>
          </section>


          {/* ========== SURFACES ========== */}
          <section id="surfaces" className="ds-section">
            <h2 className="ds-section-title">Surfaces</h2>
            <p className="ds-section-desc">
              Solid surface containers for when glass isn't appropriate.
            </p>

            <div className="ds-demo-row" style={{ alignItems: 'stretch' }}>
              <div className="surface" style={{ flex: 1, padding: 'var(--space-10)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)' }}>.surface</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Raised background with subtle border. Good for cards and containers.</div>
              </div>
              <div className="surface-overlay" style={{ flex: 1, padding: 'var(--space-10)' }}>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-3)' }}>.surface-overlay</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Higher elevation with shadow. For dialogs, dropdowns, and popovers.</div>
              </div>
            </div>

            <div className="ds-code">{`<div class="surface">Card content</div>
<div class="surface-overlay">Modal content</div>`}</div>
          </section>


          {/* ========== USAGE ========== */}
          <section id="usage" className="ds-section">
            <h2 className="ds-section-title">Getting Started</h2>
            <p className="ds-section-desc">
              Import the design system into any experiment with a single line.
              All tokens and component classes are immediately available.
            </p>

            <div className="ds-code">{`// In your experiment component
import '../../styles/ds.css'

// Use tokens in your CSS
.my-card {
  background: var(--color-glass-300);
  backdrop-filter: blur(var(--blur-2xl));
  border: 1px solid var(--color-border-glass);
  border-radius: var(--radius-lg);
  padding: var(--space-12);
  box-shadow: var(--shadow-glass);
}

// Or use component classes directly
<div class="glass">
  <h2 style={{ fontSize: 'var(--font-size-xl)' }}>Hello</h2>
  <button class="btn btn-primary">Get Started</button>
</div>`}</div>
          </section>

        </main>
      </div>
    </div>
  )
}
