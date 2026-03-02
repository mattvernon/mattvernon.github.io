import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Desktop from './experiments/desktop/Desktop'
import Y2KRacer from './experiments/y2k_racer/Y2KRacer'
import ReelMaker from './experiments/reel-maker/ReelMaker'
import HomeExperiment from './experiments/home/Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experiments/mattOS" element={<Desktop />} />
        <Route path="/experiments/y2kracer" element={<Y2KRacer />} />
        <Route path="/experiments/reelmaker" element={<ReelMaker />} />
        <Route path="/experiments/home" element={<HomeExperiment />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
