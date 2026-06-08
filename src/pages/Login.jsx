import { useState } from 'react'
import { supabase } from '../supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('login') // login | signup | magic

  async function handleSubmit() {
    setLoading(true)
    setError('')

    try {
      if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({ email })
        if (error) throw error
        alert('Magic link sent — check your email.')
        return
      }

      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert('Check your email to confirm your account.')
        return
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-center px-6 py-12"
      style={{ background: 'var(--bg)' }}
    >
      {/* Logo */}
      <div className="text-center mb-10">
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: '#F5A623', marginBottom: 8 }}>
          TICKET INTELLIGENCE
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
          TicketFlip
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-dim)', marginTop: 6 }}>
          Presale opportunities, scored automatically.
        </p>
      </div>

      {/* Form */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '24px 20px',
        }}
      >
        {error && (
          <div
            style={{
              background: 'var(--red-dim)',
              border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 8,
              padding: '10px 12px',
              marginBottom: 16,
              fontSize: 13,
              color: '#F87171',
            }}
          >
            {error}
          </div>
        )}

        <div className="mb-4">
          <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }} className="mono">
            EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: '100%',
              background: '#0A0A18',
              border: '1px solid var(--border-accent)',
              borderRadius: 8,
              padding: '12px 14px',
              fontSize: 15,
              color: 'var(--text)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {mode !== 'magic' && (
          <div className="mb-6">
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }} className="mono">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{
                width: '100%',
                background: '#0A0A18',
                border: '1px solid var(--border-accent)',
                borderRadius: 8,
                padding: '12px 14px',
                fontSize: 15,
                color: 'var(--text)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !email}
          style={{
            width: '100%',
            background: loading ? '#2A2A1A' : '#F5A623',
            color: loading ? '#6B6B8A' : '#0A0A0A',
            border: 'none',
            borderRadius: 10,
            padding: '14px',
            fontSize: 15,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Magic Link'}
        </button>

        {/* Mode switchers */}
        <div className="flex flex-col gap-2 mt-4 text-center">
          {mode !== 'login' && (
            <button
              onClick={() => setMode('login')}
              style={{ fontSize: 13, color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Sign in with password
            </button>
          )}
          {mode !== 'signup' && (
            <button
              onClick={() => setMode('signup')}
              style={{ fontSize: 13, color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Create account
            </button>
          )}
          {mode !== 'magic' && (
            <button
              onClick={() => setMode('magic')}
              style={{ fontSize: 13, color: '#60A5FA', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Send magic link instead
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
