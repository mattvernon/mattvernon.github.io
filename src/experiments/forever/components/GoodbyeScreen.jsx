import { useState, useEffect } from 'react'

function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 5,
      color: ['#FFD700', '#FF6B00', '#FF1493', '#00BFFF', '#7CFC00', '#FF4500', '#9B59B6', '#E74C3C'][i % 8],
      size: 6 + Math.random() * 10,
      rotation: Math.random() * 360,
      drift: -30 + Math.random() * 60,
    }))
  )

  return (
    <div className="confetti-container">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            backgroundColor: p.color,
            width: p.size,
            height: p.size * 0.6,
            '--rotation': `${p.rotation}deg`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
    </div>
  )
}

export default function GoodbyeScreen() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(t)
  }, [])

  return (
    <div className={`goodbye-screen${visible ? ' goodbye-screen--visible' : ''}`}>
      <Confetti />
      <div className="goodbye-content">
        <img
          src="/photos/forever/WordArt.png"
          alt="Foundation Forever"
          className="goodbye-wordart"
          draggable={false}
        />
      </div>
    </div>
  )
}
