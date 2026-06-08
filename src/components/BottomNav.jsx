import { useLocation, useNavigate } from 'react-router-dom'

const TABS = [
  { path: '/', label: 'Plays', icon: TabHome },
  { path: '/artists', label: 'Artists', icon: TabArtists },
  { path: '/history', label: 'History', icon: TabHistory },
  { path: '/settings', label: 'Settings', icon: TabSettings },
]

function TabHome({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? '#F5A623' : '#6B6B8A'} strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function TabArtists({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? '#F5A623' : '#6B6B8A'} strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
    </svg>
  )
}

function TabHistory({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? '#F5A623' : '#6B6B8A'} strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function TabSettings({ active }) {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke={active ? '#F5A623' : '#6B6B8A'} strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  // Hide on opportunity detail page
  if (location.pathname.startsWith('/opportunity/')) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex justify-around items-center"
      style={{
        background: 'rgba(8, 8, 15, 0.95)',
        borderTop: '1px solid var(--border)',
        maxWidth: 480,
        margin: '0 auto',
        padding: '10px 0 calc(10px + env(safe-area-inset-bottom))',
        backdropFilter: 'blur(12px)',
        zIndex: 50,
      }}
    >
      {TABS.map(({ path, label, icon: Icon }) => {
        const active = path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(path)
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-1 px-4 py-1"
            style={{ background: 'none', border: 'none', cursor: 'pointer', minWidth: 60 }}
          >
            <Icon active={active} />
            <span
              className="mono"
              style={{
                fontSize: 10,
                color: active ? '#F5A623' : '#6B6B8A',
                letterSpacing: '0.05em',
              }}
            >
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
