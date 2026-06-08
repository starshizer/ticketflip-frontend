import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getArtists, addArtist, removeArtist, getSpotifyAuthUrl, syncSpotify } from '../api'

export default function Artists() {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const [addName, setAddName] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [searchParams] = useSearchParams()
  const spotifyConnected = searchParams.get('spotify') === 'connected'
  const spotifyAdded = searchParams.get('added')

  useEffect(() => {
    loadArtists()
  }, [])

  async function loadArtists() {
    setLoading(true)
    try {
      const data = await getArtists()
      setArtists(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleConnectSpotify() {
    try {
      const { url } = await getSpotifyAuthUrl()
      window.location.href = url
    } catch (e) {
      alert('Could not connect Spotify. Check settings.')
    }
  }

  async function handleSpotifySync() {
    setSyncing(true)
    try {
      const result = await syncSpotify()
      alert(`Sync complete. Added ${result.added} new artists.`)
      await loadArtists()
    } catch (e) {
      alert('Sync failed. You may need to reconnect Spotify in Settings.')
    } finally {
      setSyncing(false)
    }
  }

  async function handleAddArtist() {
    if (!addName.trim()) return
    try {
      await addArtist({ name: addName.trim() })
      setAddName('')
      setAdding(false)
      await loadArtists()
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to add artist')
    }
  }

  async function handleRemove(id, name) {
    if (!confirm(`Stop tracking ${name}?`)) return
    await removeArtist(id)
    setArtists(a => a.filter(x => x.id !== id))
  }

  const filtered = artists.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-enter pb-nav" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '52px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.15em', color: '#F5A623', marginBottom: 4 }}>
          TRACKING
        </div>
        <div className="flex items-center justify-between">
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Artists</h1>
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-dim)' }}>{artists.length} tracked</span>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Spotify banner */}
        {spotifyConnected && (
          <div style={{
            background: '#0A1A0A',
            border: '1px solid #1A4A1A',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 14,
            fontSize: 13,
            color: '#4ADE80',
          }}>
            ✓ Spotify connected — {spotifyAdded} artists imported
          </div>
        )}

        {/* Spotify sync */}
        <div style={{
          background: '#0A0F0A',
          border: '1px solid #1A2A1A',
          borderRadius: 12,
          padding: '14px',
          marginBottom: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Spotify Sync</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
              Import all artists you follow
            </div>
          </div>
          <button
            onClick={artists.length > 0 ? handleSpotifySync : handleConnectSpotify}
            disabled={syncing}
            style={{
              background: '#1DB95420',
              border: '1px solid #1DB95440',
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: '#1DB954',
              cursor: 'pointer',
            }}
          >
            {syncing ? 'Syncing...' : artists.length > 0 ? '↻ Sync' : 'Connect'}
          </button>
        </div>

        {/* Manual add */}
        {adding ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-accent)',
            borderRadius: 12,
            padding: '14px',
            marginBottom: 14,
          }}>
            <input
              autoFocus
              value={addName}
              onChange={e => setAddName(e.target.value)}
              placeholder="Artist name..."
              onKeyDown={e => e.key === 'Enter' && handleAddArtist()}
              style={{
                width: '100%',
                background: '#0A0A18',
                border: '1px solid var(--border-accent)',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 15,
                color: 'var(--text)',
                outline: 'none',
                boxSizing: 'border-box',
                marginBottom: 10,
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setAdding(false)}
                style={{ flex: 1, background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '10px', fontSize: 13, color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddArtist}
                style={{ flex: 2, background: 'var(--accent-dim)', border: '1px solid #F5A62340', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, color: '#F5A623', cursor: 'pointer' }}
              >
                Add Artist
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{
              width: '100%',
              background: 'none',
              border: '1px dashed var(--border-accent)',
              borderRadius: 12,
              padding: '12px',
              fontSize: 14,
              color: 'var(--text-dim)',
              cursor: 'pointer',
              marginBottom: 14,
            }}
          >
            + Add artist manually
          </button>
        )}

        {/* Search */}
        {artists.length > 6 && (
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search artists..."
            style={{
              width: '100%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 14,
              color: 'var(--text)',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: 12,
            }}
          />
        )}

        {/* Artist list */}
        {loading ? (
          <div className="mono" style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center', padding: '40px 0' }}>
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)', fontSize: 14 }}>
            {artists.length === 0 ? 'No artists yet — connect Spotify or add manually.' : 'No results.'}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(artist => (
              <div
                key={artist.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                {artist.image_url ? (
                  <img src={artist.image_url} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: 36, height: 36, background: '#12122A', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  }}>
                    🎵
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{artist.name}</div>
                  {artist.genre && (
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'capitalize' }}>{artist.genre}</div>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(artist.id, artist.name)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', fontSize: 18, padding: '4px' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
