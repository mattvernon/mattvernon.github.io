import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* future experiments go here */}
        {/* <Route path="/experiments/my-thing" element={<MyThing />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
