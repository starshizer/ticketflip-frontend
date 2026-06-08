import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../supabase'
import {
  getMySettings, updateMySettings,
  getGmailAuthUrl, getGmailAccounts, disconnectGmail,
  getSpotifyAuthUrl, triggerEmailPoll,
} from '../api'

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.15em', marginBottom: 10 }}>
        {title}
      </div>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, value, onPress, right, danger }) {
  return (
    <button
      onClick={onPress}
      style={{
        width: '100%',
        background: 'none',
        border: 'none',
        borderBottom: '1px solid var(--border)',
        padding: '14px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: onPress ? 'pointer' : 'default',
        textAlign: 'left',
      }}
    >
      <span style={{ fontSize: 14, color: danger ? '#F87171' : 'var(--text)' }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{right || value}</span>
    </button>
  )
}

export default function Settings({ session }) {
  const [settings, setSettings] = useState(null)
  const [gmailAccounts, setGmailAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [polling, setPolling] = useState(false)
  const [searchParams] = useSearchParams()
  const gmailConnected = searchParams.get('gmail') === 'connected'

  useEffect(() => {
    Promise.all([getMySettings(), getGmailAccounts()])
      .then(([s, g]) => {
        setSettings(s)
        setGmailAccounts(g)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function handleConnectGmail() {
    const { url } = await getGmailAuthUrl()
    window.location.href = url
  }

  async function handleConnectSpotify() {
    const { url } = await getSpotifyAuthUrl()
    window.location.href = url
  }

  async function handleDisconnectGmail(id) {
    await disconnectGmail(id)
    setGmailAccounts(a => a.filter(x => x.id !== id))
  }

  async function handleSaveSetting(field, value) {
    setSaving(true)
    try {
      const updated = await updateMySettings({ [field]: value })
      setSettings(updated)
    } catch (e) {
      alert('Failed to save setting')
    } finally {
      setSaving(false)
    }
  }

  async function handleEditThreshold(field, label, current) {
    const val = prompt(`${label}:`, current)
    if (val !== null && !isNaN(parseFloat(val))) {
      await handleSaveSetting(field, parseFloat(val))
    }
  }

  async function handleEditPushover(field, label) {
    const val = prompt(`Enter your ${label}:`, settings?.[field] || '')
    if (val !== null) {
      await handleSaveSetting(field, val)
    }
  }

  async function handlePollNow() {
    setPolling(true)
    try {
      const result = await triggerEmailPoll()
      alert(`Poll complete. Results: ${JSON.stringify(result.results)}`)
    } catch (e) {
      alert('Poll failed — check that Gmail is connected.')
    } finally {
      setPolling(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg)' }}>
        <div className="mono" style={{ fontSize: 13, color: 'var(--text-dim)' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div className="page-enter pb-nav" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ padding: '52px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.15em', color: '#F5A623', marginBottom: 4 }}>
          CONFIGURATION
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Settings</h1>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {gmailConnected && (
          <div style={{
            background: '#0A1A0A',
            border: '1px solid #1A4A1A',
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 16,
            fontSize: 13,
            color: '#4ADE80',
          }}>
            ✓ Gmail connected successfully
          </div>
        )}

        {/* Gmail */}
        <Section title="GMAIL INBOX">
          {gmailAccounts.length === 0 ? (
            <button
              onClick={handleConnectGmail}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 14, color: 'var(--text)' }}>Connect Gmail</span>
              <span style={{ fontSize: 13, color: '#60A5FA' }}>Connect →</span>
            </button>
          ) : (
            <>
              {gmailAccounts.map(acc => (
                <div
                  key={acc.id}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, color: 'var(--text)' }}>{acc.gmail_address}</div>
                    {acc.last_synced_at && (
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }} className="mono">
                        Last synced {new Date(acc.last_synced_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDisconnectGmail(acc.id)}
                    style={{ fontSize: 13, color: '#F87171', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={handlePollNow}
                disabled={polling}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '14px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: 13,
                  color: polling ? 'var(--text-dim)' : '#60A5FA',
                }}
              >
                {polling ? 'Polling...' : '↻ Poll inbox now'}
              </button>
            </>
          )}
        </Section>

        {/* Spotify */}
        <Section title="SPOTIFY">
          <button
            onClick={handleConnectSpotify}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: 14, color: 'var(--text)' }}>Connect / Re-sync Spotify</span>
            <span style={{ fontSize: 13, color: '#1DB954' }}>→</span>
          </button>
        </Section>

        {/* Thresholds */}
        <Section title="SCORING THRESHOLDS">
          <Row
            label="Minimum Margin"
            value={`${settings?.profit_threshold_pct || 33}%`}
            onPress={() => handleEditThreshold('profit_threshold_pct', 'Minimum margin %', settings?.profit_threshold_pct || 33)}
          />
          <Row
            label="Minimum Batch Profit"
            value={`$${settings?.profit_threshold_batch || 300}`}
            onPress={() => handleEditThreshold('profit_threshold_batch', 'Min batch profit $', settings?.profit_threshold_batch || 300)}
            right={`$${settings?.profit_threshold_batch || 300} →`}
          />
        </Section>

        {/* Notifications */}
        <Section title="NOTIFICATIONS">
          <Row
            label="Pushover User Key"
            value={settings?.pushover_user_key ? '••••••••' : 'Not set'}
            onPress={() => handleEditPushover('pushover_user_key', 'Pushover User Key')}
            right={settings?.pushover_user_key ? '✓ Set →' : 'Set →'}
          />
          <Row
            label="Pushover App Token"
            value={settings?.pushover_app_token ? '••••••••' : 'Not set'}
            onPress={() => handleEditPushover('pushover_app_token', 'Pushover App Token')}
            right={settings?.pushover_app_token ? '✓ Set →' : 'Set →'}
          />
        </Section>

        {/* Account */}
        <Section title="ACCOUNT">
          <Row label="Email" value={session?.user?.email || ''} />
          <Row label="Sign Out" onPress={handleSignOut} danger />
        </Section>

        <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', textAlign: 'center', marginTop: 8 }}>
          TicketFlip v1.0 · Email polls every 15 min
        </div>
      </div>
    </div>
  )
}
