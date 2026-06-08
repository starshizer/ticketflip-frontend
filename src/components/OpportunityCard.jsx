import { useNavigate } from 'react-router-dom'

function ScoreBadge({ score }) {
  const color = score >= 70 ? '#4ADE80' : score >= 45 ? '#F5A623' : '#A0A0C0'
  return (
    <div
      className="mono flex items-center justify-center rounded-full"
      style={{
        width: 42,
        height: 42,
        border: `2px solid ${color}40`,
        background: `${color}12`,
        fontSize: 13,
        fontWeight: 600,
        color,
        flexShrink: 0,
      }}
    >
      {Math.round(score)}
    </div>
  )
}

function PresaleCountdown({ presaleStart }) {
  if (!presaleStart) return null
  const diff = new Date(presaleStart) - new Date()
  if (diff < 0) return <span style={{ color: '#4ADE80', fontSize: 11 }}>ACTIVE NOW</span>

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) return (
    <span style={{ color: '#F5A623', fontSize: 11 }} className="mono">
      PRESALE IN {days}D
    </span>
  )
  return (
    <span style={{ color: '#F87171', fontSize: 11 }} className="mono">
      PRESALE IN {hours}H
    </span>
  )
}

export default function OpportunityCard({ opp }) {
  const navigate = useNavigate()
  const event = opp.events || {}
  const tier = opp.ticket_tiers || {}
  const artist = event.artists || {}
  const venue = event.venues || {}

  return (
    <button
      onClick={() => navigate(`/opportunity/${opp.id}`)}
      className="w-full text-left"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '14px',
        cursor: 'pointer',
        display: 'block',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div className="flex items-start gap-3">
        {/* Artist avatar */}
        {artist.image_url ? (
          <img
            src={artist.image_url}
            alt={artist.name}
            className="rounded-full object-cover flex-shrink-0"
            style={{ width: 44, height: 44 }}
          />
        ) : (
          <div
            className="rounded-full flex items-center justify-center flex-shrink-0 mono"
            style={{
              width: 44,
              height: 44,
              background: '#12122A',
              fontSize: 18,
            }}
          >
            🎟
          </div>
        )}

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }} className="truncate">
                {artist.name || event.event_name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
                {tier.tier_name} · {venue.name ? `${venue.name}, ${venue.city}` : 'Venue TBD'}
              </div>
            </div>
            <ScoreBadge score={opp.score} />
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-3">
            <div style={{
              background: 'var(--green-dim)',
              border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: 6,
              padding: '3px 8px',
            }}>
              <span className="mono" style={{ fontSize: 12, color: '#4ADE80', fontWeight: 500 }}>
                +{opp.margin_pct}%
              </span>
            </div>

            <div style={{
              background: 'var(--accent-dim)',
              border: '1px solid rgba(245,166,35,0.2)',
              borderRadius: 6,
              padding: '3px 8px',
            }}>
              <span className="mono" style={{ fontSize: 12, color: '#F5A623', fontWeight: 500 }}>
                ~${Math.round(opp.estimated_batch_profit)}
              </span>
            </div>

            <div className="ml-auto">
              <PresaleCountdown presaleStart={event.presale_start} />
            </div>
          </div>

          {/* Face value → resale */}
          <div className="mono mt-2" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            ${opp.face_value} face → ~${Math.round(opp.estimated_resale_price)} resale
            · {opp.tickets_recommended} tickets
          </div>
        </div>
      </div>
    </button>
  )
}
