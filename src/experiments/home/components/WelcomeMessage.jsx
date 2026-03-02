export default function WelcomeMessage({ mobile }) {
  return (
    <div className={`hm-welcome${mobile ? ' hm-welcome--mobile' : ''}`}>
      <div className="hm-welcome-card">
        <div className="hm-artifact-header">
          <span className="hm-artifact-filename">hello.txt</span>
          <span className="hm-artifact-type-pill">Text</span>
        </div>
        <div className="hm-welcome-body">
          <p>
            I&rsquo;m Matthew Vernon.
            <br />A founder, product designer &amp; creative director based in
            New York City.
          </p>
        </div>
      </div>
    </div>
  )
}
