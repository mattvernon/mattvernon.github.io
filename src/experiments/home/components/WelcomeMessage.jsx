export default function WelcomeMessage({ mobile }) {
  return (
    <div className={`hm-welcome${mobile ? ' hm-welcome--mobile' : ''}`}>
      <div className="hm-welcome-card">
        <div className="hm-welcome-header">
          <span className="hm-welcome-filename">hello.txt</span>
          <span className="hm-welcome-pill">Text</span>
        </div>
        <div className="hm-welcome-body">
          <p>
            I&rsquo;m Matthew Vernon.
            <br />A founder, product designer &amp; creative director based in
            New York City.
          </p>
        </div>
      </div>
      {!mobile && (
        <div className="hm-scroll-indicator">
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.25 15.75V0.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5.75 3.25L8.25 0.75L10.75 3.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5.75 13.25L8.25 15.75L10.75 13.25" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15.75 8.25H0.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.25 10.75L0.75 8.25L3.25 5.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.25 10.75L15.75 8.25L13.25 5.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="hm-scroll-indicator-text">Scroll to explore</span>
        </div>
      )}
    </div>
  )
}
