import { useEffect } from 'react'
import Navbar from '../experiments/home/components/Navbar'
import './About.css'

export default function About() {
  useEffect(() => {
    document.title = 'About — Matthew Vernon'
    document.body.style.backgroundColor = '#fff'
    document.body.style.margin = '0'
    return () => {
      document.body.style.backgroundColor = ''
    }
  }, [])

  return (
    <div className="about-page">
      <Navbar variant="about" />

      <main className="about-content">
        <h1 className="about-title">/about</h1>

        <div className="about-body">
          <p>
            Hi, I&rsquo;m Matthew Vernon &mdash; a founder, product designer &amp;
            creative director based in New York City.
          </p>
          <p>
            For the past 6 years, I&rsquo;ve been a cofounder at Foundation Labs, a
            technology company building software for creativity, culture and
            commerce.
          </p>
          <p>This page is a WIP.</p>
        </div>
      </main>
    </div>
  )
}
