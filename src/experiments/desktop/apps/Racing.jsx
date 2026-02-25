export default function Racing() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#000' }}>
      <iframe
        src="/experiments/racing"
        title="Street Racer Underground"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        allow="autoplay"
      />
    </div>
  )
}
