import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Desktop from './experiments/desktop/Desktop'
import Racing from './experiments/racing/Racing'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experiments/mattOS" element={<Desktop />} />
        <Route path="/experiments/y2kracer" element={<Racing />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
