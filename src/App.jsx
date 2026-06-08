import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import OpportunityDetail from './pages/OpportunityDetail'
import Artists from './pages/Artists'
import History from './pages/History'
import Settings from './pages/Settings'
import BottomNav from './components/BottomNav'

function ProtectedLayout({ session }) {
  return (
    <div className="relative">
      <Routes>
        <Route path="/" element={<Dashboard session={session} />} />
        <Route path="/opportunity/:id" element={<OpportunityDetail />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings session={session} />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Loading state
  if (session === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg)' }}>
        <div className="mono text-sm" style={{ color: 'var(--text-dim)' }}>loading...</div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/*"
          element={session ? <ProtectedLayout session={session} /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}
