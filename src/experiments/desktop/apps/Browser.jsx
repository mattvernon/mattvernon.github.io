import { useState, useRef, useCallback } from 'react'

const DEFAULT_URL = 'https://matthewvernon.co'

export default function Browser() {
  const [url, setUrl] = useState(DEFAULT_URL)
  const [inputValue, setInputValue] = useState(DEFAULT_URL)
  const [isLoading, setIsLoading] = useState(true)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)
  const iframeRef = useRef(null)
  const historyRef = useRef({ stack: [DEFAULT_URL], index: 0 })

  const navigate = useCallback((newUrl) => {
    // Add https:// if no protocol specified
    let fullUrl = newUrl.trim()
    if (fullUrl && !fullUrl.match(/^https?:\/\//)) {
      // If it looks like a URL (has a dot), add https://
      // Otherwise, search Google
      if (fullUrl.includes('.')) {
        fullUrl = 'https://' + fullUrl
      } else {
        fullUrl = `https://www.google.com/search?igu=1&q=${encodeURIComponent(fullUrl)}`
      }
    }

    const history = historyRef.current
    // Truncate forward history when navigating to new page
    history.stack = history.stack.slice(0, history.index + 1)
    history.stack.push(fullUrl)
    history.index = history.stack.length - 1

    setUrl(fullUrl)
    setInputValue(fullUrl)
    setIsLoading(true)
    setCanGoBack(history.index > 0)
    setCanGoForward(false)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate(inputValue)
  }

  const handleBack = () => {
    const history = historyRef.current
    if (history.index > 0) {
      history.index--
      const prevUrl = history.stack[history.index]
      setUrl(prevUrl)
      setInputValue(prevUrl)
      setIsLoading(true)
      setCanGoBack(history.index > 0)
      setCanGoForward(history.index < history.stack.length - 1)
    }
  }

  const handleForward = () => {
    const history = historyRef.current
    if (history.index < history.stack.length - 1) {
      history.index++
      const nextUrl = history.stack[history.index]
      setUrl(nextUrl)
      setInputValue(nextUrl)
      setIsLoading(true)
      setCanGoBack(history.index > 0)
      setCanGoForward(history.index < history.stack.length - 1)
    }
  }

  const handleRefresh = () => {
    setIsLoading(true)
    const iframe = iframeRef.current
    if (iframe) {
      iframe.src = url
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className="browser">
      <div className="browser-toolbar">
        <div className="browser-nav-buttons">
          <button
            className={`browser-nav-btn ${!canGoBack ? 'disabled' : ''}`}
            onClick={handleBack}
            disabled={!canGoBack}
            title="Back"
          >
            ◀
          </button>
          <button
            className={`browser-nav-btn ${!canGoForward ? 'disabled' : ''}`}
            onClick={handleForward}
            disabled={!canGoForward}
            title="Forward"
          >
            ▶
          </button>
          <button
            className="browser-nav-btn"
            onClick={handleRefresh}
            title="Reload"
          >
            {isLoading ? '✕' : '↻'}
          </button>
        </div>
        <form className="browser-url-form" onSubmit={handleSubmit}>
          <input
            className="browser-url-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="Enter a web address..."
            spellCheck={false}
          />
        </form>
      </div>
      <div className="browser-viewport">
        <iframe
          ref={iframeRef}
          className="browser-iframe"
          src={url}
          title="Browser"
          onLoad={handleLoad}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          referrerPolicy="no-referrer"
        />
        {isLoading && (
          <div className="browser-loading">
            <div className="browser-loading-bar" />
          </div>
        )}
      </div>
    </div>
  )
}
