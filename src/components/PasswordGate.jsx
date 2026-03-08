import { useState, useEffect, useRef } from 'react'

/**
 * Client-side password gate.
 * Compares SHA-256(input) against the provided hash.
 * Auth persists for the browser session via sessionStorage.
 */

const STORAGE_KEY = 'pw-gate-authed'

async function sha256(text) {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

/* inject the shake keyframes once */
if (typeof document !== 'undefined' && !document.getElementById('pw-gate-shake')) {
  const style = document.createElement('style')
  style.id = 'pw-gate-shake'
  style.textContent = `
    @keyframes pw-shake {
      0%   { transform: translateX(0); }
      10%  { transform: translateX(-8px); }
      20%  { transform: translateX(8px); }
      30%  { transform: translateX(-6px); }
      40%  { transform: translateX(6px); }
      50%  { transform: translateX(-4px); }
      60%  { transform: translateX(4px); }
      70%  { transform: translateX(-2px); }
      80%  { transform: translateX(2px); }
      90%  { transform: translateX(-1px); }
      100% { transform: translateX(0); }
    }
    .pw-toggle:hover path { fill: #fff; }
  `
  document.head.appendChild(style)
}

export default function PasswordGate({ hash, children, slug }) {
  const storageKey = `${STORAGE_KEY}-${slug}`
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(storageKey) === 'true')
  const [value, setValue] = useState('')
  const [shaking, setShaking] = useState(false)
  const [checking, setChecking] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!authed && inputRef.current) inputRef.current.focus()
  }, [authed])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setChecking(true)
    const digest = await sha256(value)
    if (digest === hash) {
      sessionStorage.setItem(storageKey, 'true')
      setAuthed(true)
    } else {
      setValue('')
      setShaking(true)
      setTimeout(() => {
        setShaking(false)
        inputRef.current?.focus()
      }, 500)
    }
    setChecking(false)
  }

  if (authed) return children

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.lock}>
          <svg width="32" height="30" viewBox="0 0 24 23" fill="none">
            <path d="M23.4102 1.41406L1.99609 22.8281L0.582031 21.4141L4.93262 17.0625C3.54565 16.0798 2.47157 14.9508 1.71094 14.0098C1.23498 13.4209 0.876024 12.8982 0.633789 12.5195C0.512554 12.33 0.419737 12.1756 0.356445 12.0664C0.324886 12.012 0.300376 11.9685 0.283203 11.9375C0.274674 11.9221 0.267663 11.9096 0.262695 11.9004L0.254883 11.8848L0.253906 11.8838C0.253895 11.8834 0.264703 11.8763 1.13672 11.4141C0.322238 10.9651 0.265476 10.9332 0.261719 10.9307V10.9297L0.262695 10.9277L0.27832 10.9004C0.287855 10.8836 0.301299 10.8602 0.318359 10.8311C0.352762 10.7722 0.403058 10.6889 0.467773 10.585C0.597213 10.3771 0.787449 10.0851 1.03711 9.7373C1.5354 9.04326 2.27652 8.11733 3.25195 7.18945C5.19424 5.34192 8.14409 3.41419 11.9961 3.41406C14.0022 3.41413 15.7767 3.93941 17.293 4.70215L21.9961 0L23.4102 1.41406ZM21.3564 7.72168C22.1797 8.55944 22.7732 9.36135 23.1631 9.95801C23.3583 10.2567 23.5034 10.5057 23.6016 10.6836C23.6506 10.7726 23.6887 10.8442 23.7148 10.8955C23.7278 10.921 23.7376 10.9418 23.7451 10.957C23.7488 10.9646 23.7525 10.9707 23.7549 10.9756C23.7561 10.978 23.757 10.9806 23.7578 10.9824L23.7588 10.9844V10.9854L23.7598 10.9863L23.9785 11.4492L23.7314 11.8965L22.8555 11.4141L23.7305 11.8975V11.8984L23.7295 11.9004L23.7139 11.9277C23.7043 11.9445 23.6908 11.968 23.6738 11.9971C23.6394 12.0559 23.5891 12.1393 23.5244 12.2432C23.395 12.451 23.2046 12.7432 22.9551 13.0908C22.4568 13.7848 21.7156 14.7109 20.7402 15.6387C18.7979 17.4862 15.848 19.4139 11.9961 19.4141C11.5217 19.414 11.0591 19.3838 10.6104 19.3291L9.61816 19.208L9.85938 17.2236L10.8525 17.3438C11.2234 17.389 11.605 17.414 11.9961 17.4141C15.1436 17.4139 17.6243 15.8417 19.3613 14.1895C20.2253 13.3676 20.8871 12.5431 21.3311 11.9248C21.4787 11.7191 21.5994 11.535 21.6973 11.3848C21.6383 11.2867 21.5694 11.1745 21.4893 11.0518C21.1577 10.5443 20.6449 9.85085 19.9307 9.12402L19.2295 8.41016L20.6553 7.00879L21.3564 7.72168ZM6.42188 7.19531C5.75777 7.64124 5.15946 8.13587 4.63086 8.63867C3.76676 9.46065 3.10508 10.285 2.66113 10.9033C2.52001 11.0999 2.40228 11.2756 2.30664 11.4219C2.31065 11.4282 2.31428 11.435 2.31836 11.4414C2.52742 11.7682 2.84384 12.2299 3.2666 12.7529C4.00131 13.6619 5.04063 14.736 6.37109 15.624L8.05762 13.9375C6.79623 12.8383 5.99609 11.2207 5.99609 9.41406C5.99609 8.63006 6.14831 7.88185 6.42188 7.19531ZM11.9961 5.41406C9.78738 5.41406 7.99609 7.20535 7.99609 9.41406C7.99609 10.6666 8.57214 11.7852 9.47559 12.5195L15.1016 6.89355C14.3672 5.99011 13.2487 5.41406 11.9961 5.41406ZM1.13672 11.4141L0.25293 11.8828L0 11.4043L0.260742 10.9316L1.13672 11.4141Z" fill="rgba(255,255,255,0.5)"/>
          </svg>
        </div>
        <h2 style={styles.title}>This experiment is private</h2>
        <p style={styles.subtitle}>Enter the password to continue</p>
        <div style={{ ...styles.inputWrap, ...(shaking ? { animation: 'pw-shake 0.5s ease' } : {}) }}>
          <input
            ref={inputRef}
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Password"
            style={styles.input}
            autoComplete="off"
          />
          <button
            type="button"
            className="pw-toggle"
            onMouseDown={(e) => {
              e.preventDefault()
              const pos = inputRef.current?.selectionStart ?? value.length
              setShowPassword((p) => !p)
              requestAnimationFrame(() => {
                const el = inputRef.current
                if (el) { el.focus(); el.setSelectionRange(pos, pos) }
              })
            }}
            style={styles.toggle}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <path d="M8.00018 0C12.7294 0 15.7441 5.28291 15.8723 5.51172C16.0433 5.81572 16.0423 6.18819 15.8713 6.49219C15.7428 6.71883 12.7059 12 8.00018 12C3.2699 11.9999 0.254843 6.71454 0.128113 6.48926C-0.0418872 6.18626 -0.0428403 5.81667 0.12616 5.51367C0.252506 5.2863 3.24643 0.000135971 8.00018 0ZM8.00018 2C5.14643 2.00012 2.95892 4.83493 2.18182 5.99902C2.96294 7.16214 5.15946 9.99988 8.00018 10C10.8372 10 13.0345 7.166 13.8185 6C13.0365 4.835 10.8392 2 8.00018 2ZM8.00018 4C9.10475 4 10.0002 4.89543 10.0002 6C10.0002 7.10457 9.10475 8 8.00018 8C6.8957 7.9999 6.00018 7.10451 6.00018 6C6.00018 4.89549 6.8957 4.0001 8.00018 4Z" fill="rgba(255,255,255,0.45)"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M14.2932 0.292969C14.6841 -0.0979194 15.3162 -0.0976959 15.7072 0.292969C16.0982 0.683969 16.0982 1.31603 15.7072 1.70703L1.70724 15.707C1.51225 15.902 1.25619 16 1.00021 16C0.744346 15.9999 0.488082 15.9019 0.293182 15.707C-0.0974696 15.316 -0.0976448 14.6838 0.292206 14.2939L2.8215 11.7656C1.1725 10.2916 0.198143 8.61426 0.128143 8.48926C-0.0416514 8.18645 -0.0425107 7.81749 0.12619 7.51465C0.251187 7.28965 3.24544 2.00029 8.00021 2C9.33121 2 10.516 2.43109 11.549 3.03809L14.2932 0.292969ZM14.5744 5.66895C15.3724 6.63095 15.8253 7.4277 15.8723 7.5127C16.0432 7.81666 16.0423 8.18825 15.8713 8.49219C15.7438 8.71714 12.7068 14 8.00021 14C7.45736 14 6.93945 13.9238 6.44357 13.7998L8.259 11.9854C10.9698 11.8201 13.0596 9.12995 13.8195 8C13.6566 7.7571 13.4284 7.44053 13.1506 7.09375L14.5744 5.66895ZM8.00021 4C5.14664 4.00026 2.95899 6.8349 2.18185 7.99902C2.55985 8.56202 3.28545 9.51068 4.24045 10.3467L6.07443 8.5127C6.02943 8.3487 6.00021 8.178 6.00021 8C6.00036 6.89526 6.89549 6.00021 8.00021 6C8.17821 6 8.34891 6.02922 8.51291 6.07422L10.0783 4.50781C9.43745 4.20092 8.74206 4 8.00021 4Z" fill="rgba(255,255,255,0.45)"/>
              </svg>
            )}
          </button>
        </div>
        <button type="submit" style={styles.btn} disabled={checking || !value}>
          {checking ? 'Checking…' : 'Enter'}
        </button>
      </form>
    </div>
  )
}

const styles = {
  page: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#111',
    fontFamily: "'Suisse Intl', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    WebkitFontSmoothing: 'antialiased',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 340,
    padding: '40px 32px 32px',
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
  },
  lock: {
    marginBottom: 16,
    lineHeight: 0,
  },
  title: {
    margin: 0,
    fontSize: 18,
    fontWeight: 600,
    color: '#fff',
    letterSpacing: '-0.01em',
  },
  subtitle: {
    margin: '6px 0 24px',
    fontSize: 14,
    color: 'rgba(255,255,255,0.45)',
  },
  inputWrap: {
    position: 'relative',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    boxSizing: 'border-box',
  },
  input: {
    flex: 1,
    padding: '12px 40px 12px 16px',
    fontSize: 15,
    fontFamily: 'inherit',
    color: '#fff',
    background: 'transparent',
    border: 'none',
    borderRadius: 12,
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  toggle: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    lineHeight: 0,
  },
  btn: {
    width: '100%',
    marginTop: 16,
    padding: '12px 0',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: 'inherit',
    color: '#fff',
    background: 'rgba(255,255,255,0.12)',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
}
