import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOpportunity, recordAction, refreshOpportunityPrices } from '../api'

function StatBox({ label, value, color = 'var(--text)' }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '12px',
      flex: 1,
    }}>
      <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 4 }}>
        {label}
      </div>
      <div className="mono" style={{ fontSize: 18, fontWeight: 600, color }}>
        {value}
      </div>
    </div>
  )
}

export default function OpportunityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [opp, setOpp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [showSoldForm, setShowSoldForm] = useState(false)
  const [soldData, setSoldData] = useState({ tickets: '', buyPrice: '', sellPrice: '', notes: '' })

  useEffect(() => {
    getOpportunity(id)
      .then(setOpp)
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleAction(action) {
    setActing(true)
    try {
      await recordAction({ opportunity_id: id, action })
      navigate('/')
    } catch (e) {
      alert('Something went wrong. Try again.')
    } finally {
      setActing(false)
    }
  }

  async function handleSold() {
    setActing(true)
    try {
      const result = await recordAction({
        opportunity_id: id,
        action: 'sold',
        tickets_quantity: parseInt(soldData.tickets),
        buy_price_per_ticket: parseFloat(soldData.buyPrice),
        sell_price_per_ticket: parseFloat(soldData.sellPrice),
        notes: soldData.notes,
      })
      const profit = result.actual_profit
      navigate(`/?sold=true&profit=${profit}`)
    } catch (e) {
      alert('Something went wrong.')
    } finally {
      setActing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg)' }}>
        <div className="mono" style={{ fontSize: 13, color: 'var(--text-dim)' }}>Loading...</div>
      </div>
    )
  }

  if (!opp) return null

  const event = opp.events || {}
  const tier = opp.ticket_tiers || {}
  const artist = event.artists || {}
  const venue = event.venues || {}
  const snapshots = event.resale_snapshots || []

  const scoreColor = opp.score >= 70 ? '#4ADE80' : opp.score >= 45 ? '#F5A623' : '#A0A0C0'
  const isPursuing = opp.status === 'pursuing'

  return (
    <div className="page-enter" style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 32 }}>
      {/* Back header */}
      <div style={{
        padding: '52px 16px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', color: 'var(--text-dim)' }}
        >
          ← Back
        </button>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
          OPPORTUNITY DETAIL
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>
        {/* Artist + event */}
        <div className="flex items-center gap-3 mb-6">
          {artist.image_url ? (
            <img src={artist.image_url} alt="" className="rounded-full" style={{ width: 52, height: 52, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 52, height: 52, background: '#12122A', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎟</div>
          )}
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{artist.name || event.event_name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 2 }}>
              {venue.name && `${venue.name} · ${venue.city}, ${venue.state}`}
            </div>
            {event.event_date && (
              <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            )}
          </div>
        </div>

        {/* Score + tier */}
        <div style={{
          background: 'var(--bg-card)',
          border: `1px solid ${scoreColor}33`,
          borderRadius: 12,
          padding: '14px',
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>TIER</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{tier.tier_name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>SCORE</div>
            <div className="mono" style={{ fontSize: 28, fontWeight: 700, color: scoreColor }}>{Math.round(opp.score)}</div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="flex gap-2 mb-3">
          <StatBox label="MARGIN" value={`+${opp.margin_pct}%`} color="#4ADE80" />
          <StatBox label="BATCH PROFIT" value={`~$${Math.round(opp.estimated_batch_profit)}`} color="#F5A623" />
        </div>
        <div className="flex gap-2 mb-6">
          <StatBox label="FACE VALUE" value={`$${opp.face_value}`} />
          <StatBox label="EST. RESALE" value={`$${Math.round(opp.estimated_resale_price)}`} />
          <StatBox label="TICKETS" value={opp.tickets_recommended} />
        </div>

        {/* Presale info */}
        {(event.presale_start || event.presale_code) && (
          <div style={{
            background: '#0A1A0A',
            border: '1px solid #1A3A1A',
            borderRadius: 12,
            padding: '14px',
            marginBottom: 16,
          }}>
            <div className="mono" style={{ fontSize: 11, color: '#4ADE80', marginBottom: 10, letterSpacing: '0.1em' }}>
              PRESALE INFO
            </div>
            {event.presale_start && (
              <div className="flex justify-between mb-2">
                <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Opens</span>
                <span className="mono" style={{ fontSize: 13, color: 'var(--text)' }}>
                  {new Date(event.presale_start).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            )}
            {event.presale_end && (
              <div className="flex justify-between mb-2">
                <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Closes</span>
                <span className="mono" style={{ fontSize: 13, color: 'var(--text)' }}>
                  {new Date(event.presale_end).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
            )}
            {event.presale_code && (
              <div className="flex justify-between items-center mt-2 pt-2" style={{ borderTop: '1px solid #1A3A1A' }}>
                <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Presale Code</span>
                <span className="mono" style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#4ADE80',
                  background: '#0A2A0A',
                  padding: '4px 10px',
                  borderRadius: 6,
                  letterSpacing: '0.1em',
                }}>
                  {event.presale_code}
                </span>
              </div>
            )}
            {event.ticket_url && (
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  marginTop: 12,
                  background: '#4ADE8020',
                  border: '1px solid #4ADE8040',
                  borderRadius: 8,
                  padding: '10px',
                  fontSize: 13,
                  color: '#4ADE80',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Buy on Ticketmaster →
              </a>
            )}
          </div>
        )}

        {/* Non-transferable warning */}
        {opp.non_transferable_flag && (
          <div style={{
            background: '#1A0A0A',
            border: '1px solid #4A1A1A',
            borderRadius: 12,
            padding: '14px',
            marginBottom: 16,
          }}>
            <div className="mono" style={{ fontSize: 11, color: '#F87171', marginBottom: 6, letterSpacing: '0.1em' }}>
              ⚠ TRANSFERABILITY WARNING
            </div>
            <div style={{ fontSize: 13, color: '#C0A0A0', lineHeight: 1.5 }}>
              This event may have non-transferable, ID-required, or paperless-only tickets. 
              Verify transferability before purchasing.
            </div>
          </div>
        )}

        {/* Resale price comps */}
        {snapshots.length > 0 && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '14px',
            marginBottom: 24,
          }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 10, letterSpacing: '0.1em' }}>
              RESALE COMPS
            </div>
            {snapshots.slice(0, 3).map((s, i) => (
              <div key={i} className="flex justify-between items-center mb-2">
                <span style={{ fontSize: 12, color: 'var(--text-dim)', textTransform: 'capitalize' }}>{s.platform}</span>
                <span className="mono" style={{ fontSize: 13, color: 'var(--text)' }}>
                  ${s.low_price}–${s.high_price} <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>med ${s.median_price}</span>
                </span>
              </div>
            ))}
            <button
              onClick={() => refreshOpportunityPrices(id)}
              style={{
                fontSize: 11,
                color: 'var(--text-dim)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginTop: 4,
              }}
            >
              ↻ Refresh prices
            </button>
          </div>
        )}

        {/* Action buttons */}
        {!isPursuing && !showSoldForm && (
          <div className="flex flex-col gap-3">
            <button
              onClick={() => handleAction('pursue')}
              disabled={acting}
              style={{
                background: '#4ADE8020',
                border: '1px solid #4ADE8044',
                borderRadius: 12,
                padding: '16px',
                fontSize: 15,
                fontWeight: 700,
                color: '#4ADE80',
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              ✓ I'm Pursuing This
            </button>
            <button
              onClick={() => handleAction('watchlist')}
              disabled={acting}
              style={{
                background: '#F5A62315',
                border: '1px solid #F5A62330',
                borderRadius: 12,
                padding: '14px',
                fontSize: 14,
                fontWeight: 600,
                color: '#F5A623',
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              + Add to Watchlist
            </button>
            <button
              onClick={() => handleAction('pass')}
              disabled={acting}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: '14px',
                fontSize: 14,
                color: 'var(--text-dim)',
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Pass
            </button>
          </div>
        )}

        {/* Pursuing — log the sale */}
        {isPursuing && !showSoldForm && (
          <div className="flex flex-col gap-3">
            <div style={{
              background: '#4ADE8015',
              border: '1px solid #4ADE8030',
              borderRadius: 12,
              padding: '12px 16px',
              fontSize: 14,
              color: '#4ADE80',
              textAlign: 'center',
            }}>
              ✓ You're pursuing this
            </div>
            <button
              onClick={() => setShowSoldForm(true)}
              style={{
                background: '#F5A62320',
                border: '1px solid #F5A62440',
                borderRadius: 12,
                padding: '14px',
                fontSize: 14,
                fontWeight: 600,
                color: '#F5A623',
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Log the Sale / Update P&L
            </button>
          </div>
        )}

        {/* Sold form */}
        {showSoldForm && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-accent)',
            borderRadius: 12,
            padding: '16px',
          }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 14, letterSpacing: '0.1em' }}>
              LOG SALE
            </div>
            {[
              { label: 'Tickets Sold', key: 'tickets', placeholder: '4', type: 'number' },
              { label: 'Buy Price Per Ticket', key: 'buyPrice', placeholder: `$${opp.face_value}`, type: 'number' },
              { label: 'Sell Price Per Ticket', key: 'sellPrice', placeholder: `$${Math.round(opp.estimated_resale_price)}`, type: 'number' },
            ].map(f => (
              <div key={f.key} className="mb-3">
                <label style={{ fontSize: 11, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }} className="mono">
                  {f.label.toUpperCase()}
                </label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={soldData[f.key]}
                  onChange={e => setSoldData(d => ({ ...d, [f.key]: e.target.value }))}
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
                  }}
                />
              </div>
            ))}

            {/* Preview profit */}
            {soldData.tickets && soldData.buyPrice && soldData.sellPrice && (
              <div style={{
                background: '#0A1A0A',
                borderRadius: 8,
                padding: '10px 12px',
                marginBottom: 12,
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>Estimated profit: </span>
                <span className="mono" style={{ fontSize: 15, fontWeight: 600, color: '#4ADE80' }}>
                  ${((parseFloat(soldData.sellPrice) - parseFloat(soldData.buyPrice)) * parseInt(soldData.tickets)).toFixed(0)}
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowSoldForm(false)}
                style={{
                  flex: 1,
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: 10,
                  padding: '12px',
                  fontSize: 14,
                  color: 'var(--text-dim)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSold}
                disabled={acting}
                style={{
                  flex: 2,
                  background: '#4ADE8020',
                  border: '1px solid #4ADE8044',
                  borderRadius: 10,
                  padding: '12px',
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#4ADE80',
                  cursor: 'pointer',
                }}
              >
                Save & Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
