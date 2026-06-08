import { useState, useEffect } from 'react'
import { getHistory, getPnlSummary } from '../api'

function PnlCard({ label, value, color = 'var(--text)' }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '12px',
      flex: 1,
      textAlign: 'center',
    }}>
      <div className="mono" style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 4 }}>
        {label}
      </div>
      <div className="mono" style={{ fontSize: 17, fontWeight: 600, color }}>
        {value}
      </div>
    </div>
  )
}

const ACTION_LABELS = {
  pursue: { label: 'Pursued', color: '#60A5FA' },
  pass: { label: 'Passed', color: '#6B6B8A' },
  watchlist: { label: 'Watchlisted', color: '#F5A623' },
  bought: { label: 'Bought', color: '#A78BFA' },
  listed: { label: 'Listed', color: '#F5A623' },
  sold: { label: 'Sold', color: '#4ADE80' },
}

export default function History() {
  const [history, setHistory] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getHistory(), getPnlSummary()])
      .then(([h, s]) => {
        setHistory(h)
        setSummary(s)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page-enter pb-nav" style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ padding: '52px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.15em', color: '#F5A623', marginBottom: 4 }}>
          RECORD
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>History</h1>
      </div>

      <div style={{ padding: '16px' }}>
        {/* P&L Summary */}
        {summary && summary.total_flips > 0 && (
          <div className="mb-4">
            <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 8 }}>
              ALL-TIME P&L
            </div>
            <div className="flex gap-2 mb-2">
              <PnlCard
                label="TOTAL PROFIT"
                value={`$${summary.total_profit.toLocaleString()}`}
                color={summary.total_profit >= 0 ? '#4ADE80' : '#F87171'}
              />
              <PnlCard label="FLIPS" value={summary.total_flips} color="#60A5FA" />
            </div>
            <div className="flex gap-2">
              <PnlCard label="BEST FLIP" value={`$${summary.best_flip.toLocaleString()}`} color="#F5A623" />
              <PnlCard label="AVG FLIP" value={`$${summary.average_profit_per_flip.toLocaleString()}`} />
            </div>
          </div>
        )}

        {/* History list */}
        {loading ? (
          <div className="mono" style={{ fontSize: 13, color: 'var(--text-dim)', textAlign: 'center', padding: '40px 0' }}>
            Loading...
          </div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
            <div style={{ fontSize: 15, color: 'var(--text)', marginBottom: 6 }}>No history yet</div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
              Actions you take on opportunities will appear here.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map(action => {
              const opp = action.opportunities || {}
              const event = opp.events || {}
              const artist = event.artists || {}
              const venue = event.venues || {}
              const tier = opp.ticket_tiers || {}
              const meta = ACTION_LABELS[action.action] || {}

              return (
                <div
                  key={action.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '14px',
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                        {artist.name || event.event_name || 'Unknown Event'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                        {tier.tier_name} {venue.city && `· ${venue.city}`}
                      </div>
                    </div>
                    <span
                      className="mono"
                      style={{
                        fontSize: 11,
                        color: meta.color,
                        background: `${meta.color}15`,
                        border: `1px solid ${meta.color}30`,
                        borderRadius: 6,
                        padding: '3px 8px',
                      }}
                    >
                      {meta.label}
                    </span>
                  </div>

                  {/* Sale details */}
                  {action.action === 'sold' && action.actual_profit != null && (
                    <div className="flex gap-3 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                      <div>
                        <div className="mono" style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>PROFIT</div>
                        <div className="mono" style={{ fontSize: 15, fontWeight: 600, color: action.actual_profit >= 0 ? '#4ADE80' : '#F87171' }}>
                          ${action.actual_profit.toLocaleString()}
                        </div>
                      </div>
                      {action.tickets_quantity && (
                        <div>
                          <div className="mono" style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>TICKETS</div>
                          <div className="mono" style={{ fontSize: 15, color: 'var(--text)' }}>{action.tickets_quantity}</div>
                        </div>
                      )}
                      {action.buy_price_per_ticket && action.sell_price_per_ticket && (
                        <div>
                          <div className="mono" style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>BUY→SELL</div>
                          <div className="mono" style={{ fontSize: 13, color: 'var(--text)' }}>
                            ${action.buy_price_per_ticket} → ${action.sell_price_per_ticket}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 8 }}>
                    {new Date(action.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
