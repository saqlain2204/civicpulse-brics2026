import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import CitizenPortal from './pages/CitizenPortal'
import Dashboard from './pages/Dashboard'
import ProjectTracker from './pages/ProjectTracker'
import Login from './pages/Login'

function AppContent() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/submit" element={<CitizenPortal />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectTracker />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-1)',
                border: '1px solid var(--border-strong)',
                borderRadius: '10px',
                fontSize: '14px',
                boxShadow: 'var(--shadow-lg)',
              },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}
