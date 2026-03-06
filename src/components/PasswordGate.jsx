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

export default function PasswordGate({ hash, children, slug }) {
  const storageKey = `${STORAGE_KEY}-${slug}`
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(storageKey) === 'true')
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!authed && inputRef.current) inputRef.current.focus()
  }, [authed])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setChecking(true)
    setError(false)
    const digest = await sha256(value)
    if (digest === hash) {
      sessionStorage.setItem(storageKey, 'true')
      setAuthed(true)
    } else {
      setError(true)
      setValue('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
    setChecking(false)
  }

  if (authed) return children

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.lock}>🔒</div>
        <h2 style={styles.title}>This experiment is private</h2>
        <p style={styles.subtitle}>Enter the password to continue</p>
        <input
          ref={inputRef}
          type="password"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(false) }}
          placeholder="Password"
          style={{
            ...styles.input,
            ...(error ? styles.inputError : {}),
          }}
          autoComplete="off"
        />
        {error && <p style={styles.error}>Incorrect password</p>}
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
    fontFamily: "-apple-system, 'SF Pro Display', 'Helvetica Neue', Helvetica, Arial, sans-serif",
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
    fontSize: 32,
    marginBottom: 16,
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
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: 15,
    fontFamily: 'inherit',
    color: '#fff',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  inputError: {
    borderColor: 'rgba(239,68,68,0.6)',
  },
  error: {
    margin: '8px 0 0',
    fontSize: 13,
    color: '#ef4444',
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
