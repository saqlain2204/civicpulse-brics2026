import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiActivity, FiMap, FiMessageSquare, FiBarChart2, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi'
import { useTheme } from '../contexts/ThemeContext'

const navLinks = [
  { path: '/',          label: 'Home',            icon: FiActivity },
  { path: '/submit',    label: 'Submit Feedback',  icon: FiMessageSquare },
  { path: '/dashboard', label: 'Policy Dashboard', icon: FiMap },
  { path: '/projects',  label: 'Projects',         icon: FiBarChart2 },
]

export default function Navbar() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()

  return (
    <nav style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
         className="sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                 style={{ background: 'var(--accent)' }}>
              <FiActivity size={14} style={{ color: 'var(--accent-inv)' }} />
            </div>
            <span className="font-semibold text-base" style={{ color: 'var(--text-1)' }}>
              CivicPulse
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label }) => {
              const active = location.pathname === path
              return (
                <Link key={path} to={path}
                  className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
                  style={{
                    background: active ? 'var(--bg-hover)' : 'transparent',
                    color: active ? 'var(--text-1)' : 'var(--text-2)',
                  }}>
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-2)' }}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
              {isDark ? <FiSun size={15} /> : <FiMoon size={15} />}
            </button>

            {/* Status badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                 style={{ background: 'var(--bg-hover)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
              <span className="live-dot" />
              Live
            </div>

            {/* Mobile toggle */}
            <button className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ color: 'var(--text-2)', background: 'var(--bg-hover)' }}
                    onClick={() => setOpen(!open)}>
              {open ? <FiX size={16} /> : <FiMenu size={16} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {open && (
          <div className="md:hidden pb-3 space-y-0.5 border-t" style={{ borderColor: 'var(--border)' }}>
            {navLinks.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path
              return (
                <Link key={path} to={path} onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mt-1 transition-colors"
                  style={{
                    background: active ? 'var(--bg-hover)' : 'transparent',
                    color: active ? 'var(--text-1)' : 'var(--text-2)',
                  }}>
                  <Icon size={15} /> {label}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </nav>
  )
}
