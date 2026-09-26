import { useState, useEffect } from 'react'
import { FiZap, FiRefreshCw, FiAlertTriangle, FiClock, FiMessageCircle, FiSend, FiCheckCircle, FiShield, FiTrendingUp, FiTarget } from 'react-icons/fi'
import { getRecommendations, chatWithAI } from '../api'
import toast from 'react-hot-toast'

const URGENCY_MAP = {
  Critical: { bg: 'rgba(220,38,38,0.08)',  border: 'rgba(220,38,38,0.2)',  color: '#dc2626', icon: FiAlertTriangle },
  High:     { bg: 'rgba(217,119,6,0.08)',  border: 'rgba(217,119,6,0.2)',  color: '#d97706', icon: FiAlertTriangle },
  Medium:   { bg: 'rgba(37,99,235,0.08)',  border: 'rgba(37,99,235,0.2)',  color: '#2563eb', icon: FiCheckCircle },
}

const INVEST_COLOR = { Immediate: '#dc2626', 'Short-term': '#d97706', 'Medium-term': '#2563eb' }

export default function AIRecommendations({ filterCountry = '' }) {
  const [recs, setRecs] = useState(null)
  const [loading, setLoading] = useState(false)
  const [chatQ, setChatQ] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState([])

  const load = async () => {
    setLoading(true)
    try {
      const res = await getRecommendations(filterCountry || undefined)
      setRecs(res.data.data)
    } catch {
      toast.error('Failed to generate recommendations.')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [filterCountry])

  const handleChat = async (e) => {
    e.preventDefault()
    if (!chatQ.trim()) return
    const q = chatQ
    setChatQ('')
    setChatLoading(true)
    setChatHistory(h => [...h, { role: 'user', text: q }])
    try {
      const res = await chatWithAI(q)
      setChatHistory(h => [...h, { role: 'ai', text: res.data.answer }])
    } catch {
      setChatHistory(h => [...h, { role: 'ai', text: 'Unable to process. Please try again.' }])
    }
    setChatLoading(false)
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>
            AI Policy Recommendations {filterCountry ? `— ${filterCountry}` : '(BRICS Cross-National)'}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
            Synthesizes citizen feedback with national demographic data, infrastructure indices & flagship investment plans
          </p>
        </div>
        <button onClick={load} disabled={loading} className="btn-secondary" style={{ padding: '7px 12px' }}>
          <FiRefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Regenerate
        </button>
      </div>

      {loading && (
        <div className="card p-12 text-center">
          <div className="w-8 h-8 rounded-full border border-current border-t-transparent animate-spin mx-auto mb-3"
               style={{ color: 'var(--text-3)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
            AI Policy Engine synthesizing citizen demand against national indices and public CapEx...
          </p>
        </div>
      )}

      {!loading && recs && (
        <>
          {/* Executive summary */}
          <div className="card p-5" style={{ borderColor: 'rgba(22,163,74,0.25)', background: 'rgba(22,163,74,0.03)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#16a34a' }}>Strategic Executive Summary</p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-1)' }}>{recs.executive_summary}</p>
          </div>

          {/* Cross-Cutting Themes */}
          {recs.cross_cutting_themes?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Cross-Cutting:</span>
              {recs.cross_cutting_themes.map((theme, idx) => (
                <span key={idx} className="badge badge-medium text-xs">
                  {theme}
                </span>
              ))}
            </div>
          )}

          {/* Priority recommendations */}
          <div className="space-y-4">
            {recs.priority_recommendations?.map((rec, i) => {
              const u = URGENCY_MAP[rec.urgency] || URGENCY_MAP.Medium
              const UIcon = u.icon
              return (
                <div key={i} className="card p-5 transition-all hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                         style={{ background: u.bg, color: u.color, border: `1px solid ${u.border}` }}>
                      #{rec.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-base font-bold" style={{ color: 'var(--text-1)' }}>{rec.title}</h3>
                        <span className="badge" style={{ background: u.bg, color: u.color, border: `1px solid ${u.border}` }}>
                          <UIcon size={9} /> {rec.urgency}
                        </span>
                        <span className="badge" style={{ background: 'var(--bg-2)', color: INVEST_COLOR[rec.investment_priority] || 'var(--text-2)', border: '1px solid var(--border)' }}>
                          <FiClock size={9} /> {rec.investment_priority}
                        </span>
                        {rec.sdg_target && (
                          <span className="badge badge-low text-[10px]">
                            <FiTarget size={9} /> {rec.sdg_target}
                          </span>
                        )}
                      </div>

                      {/* National Scheme Alignment Banner */}
                      {rec.national_scheme_alignment && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold mb-2.5"
                             style={{ background: 'rgba(37,99,235,0.08)', color: '#2563eb', border: '1px solid rgba(37,99,235,0.2)' }}>
                          <FiShield size={12} />
                          <span>Leverages Flagship: {rec.national_scheme_alignment}</span>
                        </div>
                      )}

                      <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-2)' }}>{rec.description}</p>

                      {/* Infrastructure Gap Analysis Box */}
                      {rec.infrastructure_gap_analysis && (
                        <div className="p-3 rounded-lg text-xs mb-3 font-medium"
                             style={{ background: 'var(--bg-2)', borderLeft: '3px solid #d97706', color: 'var(--text-1)' }}>
                          <span className="font-bold text-[#d97706]">Deficit Cross-Reference: </span>
                          {rec.infrastructure_gap_analysis}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-4 text-xs font-medium" style={{ color: 'var(--text-3)' }}>
                        <span>Sector: <b style={{ color: 'var(--text-2)' }}>{rec.category}</b></span>
                        <span>Regions: <b style={{ color: 'var(--text-2)' }}>{rec.affected_regions?.join(', ')}</b></span>
                        <span>Reach: <b style={{ color: 'var(--text-2)' }}>{rec.beneficiary_count}</b></span>
                      </div>

                      {rec.estimated_impact && (
                        <div className="mt-3 p-3 rounded-lg text-xs" style={{ background: 'var(--bg-2)', color: 'var(--text-2)' }}>
                          <span className="font-semibold text-green-600 dark:text-green-400">Impact Assessment: </span>
                          {rec.estimated_impact}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Data Insights Correlating Citizen Feedback with National Data */}
          {recs.data_insights?.length > 0 && (
            <div className="card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>
                Policy & Spending Gap Insights
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {recs.data_insights.map((insight, idx) => (
                  <div key={idx} className="p-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
                    <div className="text-xs font-bold mb-1" style={{ color: 'var(--text-1)' }}>
                      💡 {insight.insight}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-3)' }}>
                      <b>Implication:</b> {insight.implication}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SDG alignment */}
          {recs.sdg_alignment?.length > 0 && (
            <div className="card p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>UN SDG Alignment</h3>
              <div className="flex flex-wrap gap-2">
                {recs.sdg_alignment.map((sdg, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium"
                        style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                    {sdg}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* AI Chat */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
          <FiMessageCircle size={15} /> Ask about the data
        </h3>

        {chatHistory.length > 0 && (
          <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[85%] px-3.5 py-2 rounded-xl text-sm"
                     style={{
                       background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-2)',
                       color: msg.role === 'user' ? 'var(--accent-inv)' : 'var(--text-1)',
                       border: '1px solid var(--border)',
                     }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="px-3.5 py-2.5 rounded-xl" style={{ background: 'var(--bg-2)' }}>
                  <span className="flex gap-1">
                    {[0,1,2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full animate-bounce inline-block"
                            style={{ background: 'var(--text-3)', animationDelay: `${i*0.15}s` }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleChat} className="flex gap-2">
          <input value={chatQ} onChange={e => setChatQ(e.target.value)}
            placeholder="e.g. Which country has the most water issues?"
            className="input-field flex-1 text-sm" />
          <button type="submit" disabled={chatLoading || !chatQ.trim()} className="btn-primary disabled:opacity-40"
                  style={{ padding: '0 14px' }}>
            <FiSend size={13} />
          </button>
        </form>
      </div>
    </div>
  )
}
