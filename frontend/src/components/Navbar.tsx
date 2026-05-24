import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const location = useLocation()
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    } else {
      document.documentElement.setAttribute('data-theme', 'dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="flex justify-between items-center h-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 group">
            <svg className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M22 12L12 2L2 12l10 10z"/>
              <path d="M12 2v20"/>
              <path d="M2 12h20"/>
            </svg>
            <span className="font-sans text-sm font-bold tracking-widest uppercase text-text">
              AeroScout
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-10 font-sans text-[11px] tracking-widest font-semibold uppercase">
          <Link 
            to="/" 
            className={`transition-colors py-2 ${location.pathname === '/' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-text-muted hover:text-text'}`}
          >
            Platform
          </Link>
          <Link 
            to="/research" 
            className={`transition-colors py-2 ${location.pathname === '/research' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-text-muted hover:text-text'}`}
          >
            Research
          </Link>
          <Link 
            to="/about" 
            className={`transition-colors py-2 ${location.pathname === '/about' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-text-muted hover:text-text'}`}
          >
            About
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={toggleTheme}
            className="w-12 h-6 rounded-full border border-border bg-surface relative flex items-center px-1 cursor-pointer transition-colors hover:border-orange-500"
            aria-label="Toggle Theme"
          >
            <div className={`w-4 h-4 rounded-full bg-border transition-all duration-300 ${theme === 'light' ? 'translate-x-6 bg-orange-500' : ''}`} />
          </button>

          <Link 
            to="/command" 
            className="hidden md:block font-sans text-[11px] font-bold tracking-widest uppercase text-text-muted hover:text-orange-500 transition-colors"
          >
            SYS.INIT
          </Link>
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 bg-border rounded-full" />
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
            <div className="w-1.5 h-1.5 bg-border rounded-full" />
          </div>
        </div>
      </div>
    </nav>
  )
}
