import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import LandingPage from './pages/LandingPage'
import AboutPage from './pages/AboutPage'
import CommandCenter from './pages/CommandCenter'
import CapabilitiesPage from './pages/CapabilitiesPage'

function App() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/research" element={<CapabilitiesPage />} />
        <Route path="/command" element={<CommandCenter />} />
      </Routes>
    </AnimatePresence>
  )
}

export default App
