import { BrowserRouter, Routes, Route } from 'react-router-dom'
import About from './pages/About'
import Experiments from './pages/Experiments'
import Home from './experiments/home/Home'
import Desktop from './experiments/desktop/Desktop'
import Y2KRacer from './experiments/y2k_racer/Y2KRacer'
import ReelMaker from './experiments/reel-maker/ReelMaker'
import DvdScreen from './experiments/dvd-screen/DvdScreen'
import Moodboard from './experiments/moodboard/Moodboard'
import IosCart from './experiments/ios-cart/IosCart'
import Forever from './experiments/forever/Forever'
import NotFound from './pages/NotFound'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/experiments" element={<Experiments />} />
        <Route path="/experiments/mattOS" element={<Desktop />} />
        <Route path="/experiments/y2kracer" element={<Y2KRacer />} />
        <Route path="/experiments/reelmaker" element={<ReelMaker />} />
        <Route path="/experiments/dvd-screen" element={<DvdScreen />} />
        <Route path="/experiments/moodboard" element={<Moodboard />} />
        <Route path="/experiments/ioscart" element={<IosCart />} />
        <Route path="/experiments/forever" element={<Forever />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
