import { Link } from 'react-router-dom'
import { useEffect } from 'react'

export default function NotFound() {
  useEffect(() => {
    document.title = '404 — Matthew Vernon'
    document.body.style.backgroundColor = '#000'
    document.body.style.margin = '0'
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>404 — Page not found</h1>
      <Link to="/" style={styles.button}>Return to home</Link>
    </div>
  )
}

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  heading: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 500,
    marginBottom: '24px',
  },
  button: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '14px',
    textDecoration: 'none',
    padding: '10px 20px',
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.1)',
    transition: 'color 0.2s, background 0.2s',
  },
}
