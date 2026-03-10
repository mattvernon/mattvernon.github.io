import { useEffect } from 'react'
import PasswordGate from '../../components/PasswordGate'
import { PW_HASH } from './constants'
import Montage from './components/Montage'
import './Forever.css'

export default function Forever() {
  useEffect(() => {
    document.title = 'Foundation Forever'
    document.body.style.backgroundColor = '#000'
    document.body.style.margin = '0'
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.backgroundColor = ''
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <PasswordGate hash={PW_HASH} slug="forever">
      <Montage />
    </PasswordGate>
  )
}
