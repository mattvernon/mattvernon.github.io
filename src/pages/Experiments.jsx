import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../experiments/home/components/Navbar'
import './Experiments.css'

const EXPERIMENTS = [
  {
    slug: 'mattOS',
    title: 'mattOS',
    description:
      'A macintosh-style desktop environment, built right into the browser, with a few fun apps.',
    color: '#1400FF',
  },
  {
    slug: 'y2kracer',
    title: 'y2k racer',
    description:
      'An arcade style street racing game built entirely in three.js, running in the browser. My ode to racing games like Need for Speed Underground, Midnight Club and Burnout.',
    color: '#E600FF',
  },
  {
    slug: 'reelmaker',
    title: 'reel maker',
    description:
      "A single use app I'm building to create social media assets based on a dump of screenshots, GIFs and videos. Still a WIP.",
    color: '#FFE600',
  },
]

export default function Experiments() {
  useEffect(() => {
    document.title = 'Experiments — Matthew Vernon'
    document.body.style.backgroundColor = '#000'
    document.body.style.margin = '0'
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

  return (
    <div className="exp-page">
      <Navbar variant="experiments" />

      <main className="exp-content">
        <h1 className="exp-title">/experiments</h1>
        <p className="exp-subtitle">
          I've been having fun building experiments on
          <br />
          this website via Claude Code.
        </p>

        <div className="exp-cards">
          {EXPERIMENTS.map((exp) => (
            <Link
              key={exp.slug}
              to={`/experiments/${exp.slug}`}
              className={`exp-card${exp.color === '#FFE600' ? ' exp-card--dark' : ''}`}
              style={{ background: exp.color }}
            >
              <div className="exp-card-header">
                <span className="exp-card-route">/{exp.slug}</span>
                <span className="exp-card-badge">Experiment</span>
              </div>
              <h3 className="exp-card-title">{exp.title}</h3>
              <p className="exp-card-desc">{exp.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
