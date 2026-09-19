import { useState, useEffect } from 'react'
import { FiCheckCircle, FiClock, FiActivity, FiAlertTriangle } from 'react-icons/fi'
import { listFeedback } from '../api'

const STATUS = {
  pending:     { label: 'Pending',     color: 'var(--text-3)', icon: FiClock },
  in_review:   { label: 'In Review',   color: '#2563eb',       icon: FiActivity },
  approved:    { label: 'Approved',    color: '#d97706',       icon: FiAlertTriangle },
  implemented: { label: 'Implemented', color: '#16a34a',       icon: FiCheckCircle },
}

function UrgencyBadge({ score }) {
  const cls = score >= 9 ? 'badge-critical' : score >= 7 ? 'badge-high' : score >= 4 ? 'badge-medium' : 'badge-low'
  return <span className={`badge ${cls}`}>{score}/10</span>
}

export default function ProjectTracker() {
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCountry, setFilterCountry] = useState('')

  useEffect(() => {
    setLoading(true)
    listFeedback({ page, limit: 15, status: filterStatus || undefined, country: filterCountry || undefined })
      .then(r => { setItems(r.data.data); setTotal(r.data.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, filterStatus, filterCountry])

  const pages = Math.ceil(total / 15)

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>Project Tracker</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>Track citizen feedback from submission to implementation</p>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Object.entries(STATUS).map(([key, { label, color, icon: Icon }]) => {
            const count = items.filter(i => i.status === key).length
            return (
              <button key={key} onClick={() => setFilterStatus(filterStatus === key ? '' : key)}
                className="card p-4 text-left hover:shadow-lg transition-all"
                style={{ borderColor: filterStatus === key ? color : undefined }}>
                <Icon size={15} style={{ color, marginBottom: 8 }} />
                <div className="text-xl font-bold" style={{ color: 'var(--text-1)' }}>{count}</div>
                <div className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</div>
              </button>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select value={filterCountry} onChange={e => { setFilterCountry(e.target.value); setPage(1) }}
            className="input-field appearance-none text-sm" style={{ width: 'auto', padding: '7px 12px' }}>
            <option value="">All countries</option>
            {['India','Brazil','Russia','China','South Africa'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
            className="input-field appearance-none text-sm" style={{ width: 'auto', padding: '7px 12px' }}>
            <option value="">All statuses</option>
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <span className="ml-auto text-xs flex items-center" style={{ color: 'var(--text-3)' }}>
            {total.toLocaleString()} records
          </span>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 rounded-full border border-current border-t-transparent animate-spin"
                   style={{ color: 'var(--text-3)' }} />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Feedback','Category','Location','Urgency','Source','Status','Date'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-medium" style={{ color: 'var(--text-3)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => {
                      const sc = STATUS[item.status] || STATUS.pending
                      const StatusIcon = sc.icon
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}
                            className="transition-colors hover:bg-[var(--bg-hover)]">
                          <td className="py-3 px-4 max-w-xs">
                            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-1)' }}>
                              {item.translated_text || item.text}
                            </p>
                            {item.original_language && item.original_language !== 'en' && (
                              <span className="text-xs mt-0.5 block" style={{ color: 'var(--text-3)' }}>
                                {item.original_language.toUpperCase()}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-xs px-2 py-1 rounded-md whitespace-nowrap"
                                  style={{ background: 'var(--bg-2)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs whitespace-nowrap" style={{ color: 'var(--text-2)' }}>
                            {item.location?.country}<br />
                            <span style={{ color: 'var(--text-3)' }}>{item.location?.city}</span>
                          </td>
                          <td className="py-3 px-4"><UrgencyBadge score={item.urgency_score} /></td>
                          <td className="py-3 px-4 text-xs capitalize" style={{ color: 'var(--text-3)' }}>{item.source}</td>
                          <td className="py-3 px-4">
                            <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: sc.color }}>
                              <StatusIcon size={11} /> {sc.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs whitespace-nowrap" style={{ color: 'var(--text-3)' }}>
                            {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {pages > 1 && (
                <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>Page {page} of {pages}</span>
                  <div className="flex gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}
                      className="btn-secondary disabled:opacity-30" style={{ padding: '5px 12px', fontSize: 12 }}>Previous</button>
                    <button onClick={() => setPage(p => Math.min(pages, p+1))} disabled={page === pages}
                      className="btn-secondary disabled:opacity-30" style={{ padding: '5px 12px', fontSize: 12 }}>Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
