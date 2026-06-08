import { useState, useEffect } from 'react'
import { getOpportunities, getNewCount } from '../api'
import OpportunityCard from '../components/OpportunityCard'

const FILTERS = [
  { label: 'New', value: 'new' },
  { label: 'Watching', value: 'watchlist' },
  { label: 'Pursuing', value: 'pursuing' },
]

function EmptyState({ filter }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-8">
      <div style={{ fontSize: 40, marginBottom: 12 }}>🎟</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
        {filter === 'new' ? 'No new plays right now' : `Nothing ${filter} yet`}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>
        {filter === 'new'
          ? 'Connect your Gmail in Settings and add artists to start getting presale alerts.'
          : 'Opportunities you mark will appear here.'}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('new')
  const [newCount, setNewCount] = useState(0)

  useEffect(() => {
    loadOpportunities()
    getNewCount().then(d => setNewCount(d.count)).catch(() => {})
  }, [filter])

  async function loadOpportunities() {
    setLoading(true)
    try {
      const data = await getOpportunities(filter)
      setOpportunities(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-enter pb-nav" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '52px 16px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.15em', color: '#F5A623', marginBottom: 4 }}>
              TICKETFLIP
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Plays</h1>
          </div>
          {newCount > 0 && (
            <div
              className="mono"
              style={{
                background: '#F5A62322',
                border: '1px solid #F5A62344',
                borderRadius: 20,
                padding: '3px 10px',
                fontSize: 12,
                color: '#F5A623',
              }}
            >
              {newCount} new
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-0 mb-0">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px 14px',
                fontSize: 13,
                cursor: 'pointer',
                color: filter === f.value ? '#F5A623' : 'var(--text-dim)',
                borderBottom: filter === f.value ? '2px solid #F5A623' : '2px solid transparent',
                fontFamily: 'DM Mono, monospace',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  height: 100,
                  opacity: 0.5,
                }}
              />
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div className="flex flex-col gap-3">
            {opportunities.map(opp => (
              <OpportunityCard key={opp.id} opp={opp} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
