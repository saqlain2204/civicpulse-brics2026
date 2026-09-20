import { useState } from 'react'
import { FiActivity, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Small delay for UX feel
    await new Promise((r) => setTimeout(r, 500))

    const success = login(email.trim(), password)
    if (!success) {
      setError('Invalid email or password.')
      setLoading(false)
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }
    // on success AuthContext updates isAuthenticated → App redirects automatically
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      {/* Background subtle grid — same as Home hero */}
      <div className="fixed inset-0 pointer-events-none" style={{ opacity: 0.35 }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="login-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="var(--border-strong)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-grid)" />
        </svg>
      </div>

      <div className="relative w-full max-w-sm animate-fade-up">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent)' }}
          >
            <FiActivity size={17} style={{ color: 'var(--accent-inv)' }} />
          </div>
          <span className="font-semibold text-lg" style={{ color: 'var(--text-1)' }}>
            CivicPulse
          </span>
        </div>

        {/* Card */}
        <div
          className="card p-8"
          style={{
            animation: shake ? 'shake 0.5s ease' : undefined,
          }}
        >
          <div className="mb-6">
            <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>
              Admin sign in
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-3)' }}>
              BRICS AI Infrastructure Governance Platform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: 'var(--text-2)' }}
              >
                Email address
              </label>
              <div className="relative">
                <FiMail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-3)' }}
                />
                <input
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: '36px' }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: 'var(--text-2)' }}
              >
                Password
              </label>
              <div className="relative">
                <FiLock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'var(--text-3)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  style={{ paddingLeft: '36px', paddingRight: '40px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                className="text-xs px-3 py-2.5 rounded-lg animate-fade-in"
                style={{
                  background: 'rgba(220,38,38,0.08)',
                  border: '1px solid rgba(220,38,38,0.2)',
                  color: '#dc2626',
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full justify-center mt-2"
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      width: 13,
                      height: 13,
                      border: '2px solid var(--accent-inv)',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in <FiArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-3)' }}>
          CivicPulse · BRICS 2026 · Amplifying Every Voice
        </p>
      </div>

      {/* Inline keyframes for shake + spin */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-6px); }
          30%       { transform: translateX(6px); }
          45%       { transform: translateX(-5px); }
          60%       { transform: translateX(5px); }
          75%       { transform: translateX(-3px); }
          90%       { transform: translateX(3px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

