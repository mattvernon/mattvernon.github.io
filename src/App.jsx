import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Desktop from './experiments/desktop/Desktop'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/experiments/mattOS" element={<Desktop />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
