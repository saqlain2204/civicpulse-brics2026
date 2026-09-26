import { useState, useEffect } from 'react'
import { FiTarget, FiAlertCircle, FiCheckCircle, FiLayers, FiDollarSign, FiFilter, FiActivity } from 'react-icons/fi'
import { getSdgAlignment, getPriorityMatrix } from '../api'

const SDG_COLORS = {
  2: '#DDA63A',   // Zero Hunger
  3: '#4C9F38',   // Good Health
  4: '#C5192D',   // Quality Education
  6: '#26BDE2',   // Clean Water
  7: '#FCC30B',   // Clean Energy
  9: '#FD6925',   // Industry, Innovation & Infrastructure
  11: '#FD9D24',  // Sustainable Cities
  13: '#3F7E44',  // Climate Action
  15: '#56C02B',  // Life on Land
  16: '#00689D',  // Peace, Justice
}

export default function SdgAlignmentView({ filterCountry = '' }) {
  const [sdgData, setSdgData] = useState(null)
  const [matrixData, setMatrixData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState('all')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getSdgAlignment(),
      getPriorityMatrix(filterCountry || undefined)
    ])
      .then(([sdgRes, matrixRes]) => {
        setSdgData(sdgRes.data)
        setMatrixData(matrixRes.data)
      })
      .catch(err => console.error('Failed to load SDG/Matrix data:', err))
      .finally(() => setLoading(false))
  }, [filterCountry])

  if (loading) {
    return (
      <div className="card p-12 text-center">
        <div className="w-8 h-8 rounded-full border border-current border-t-transparent animate-spin mx-auto mb-3"
             style={{ color: 'var(--text-3)' }} />
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>Synthesizing UN SDG metrics & priority deficit matrix...</p>
      </div>
    )
  }

  const filteredProjects = matrixData?.projects?.filter(p => {
    if (selectedTier === 'all') return true
    return p.priority_tier.toLowerCase().includes(selectedTier.toLowerCase())
  }) || []

  return (
    <div className="space-y-8">
      {/* ── Section 1: UN SDG Alignment Dashboard ── */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>
              UN Sustainable Development Goals (SDG) Alignment
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>
              Real-time classification of citizen infrastructure requests mapped to UN 2030 Agenda targets
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-medium">
              <FiTarget size={11} /> {sdgData?.sdg_coverage_count || 0} SDGs Actively Targeted
            </span>
            <span className="badge badge-low">
              <FiCheckCircle size={11} /> {sdgData?.total_mapped_submissions || 0} Mapped Submissions
            </span>
          </div>
        </div>

        {/* SDG Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sdgData?.sdgs?.map(sdg => {
            const color = SDG_COLORS[sdg.sdg] || '#2563eb'
            return (
              <div
                key={sdg.sdg_code}
                className="card p-4 relative overflow-hidden transition-all hover:shadow-md"
                style={{ borderTop: `4px solid ${color}` }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                          style={{ background: 'var(--bg-2)', color }}>
                      SDG {sdg.sdg}
                    </span>
                    <h3 className="text-sm font-semibold mt-1.5" style={{ color: 'var(--text-1)' }}>
                      {sdg.name.replace(`SDG ${sdg.sdg}: `, '')}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold font-mono" style={{ color: 'var(--text-1)' }}>
                      {sdg.total_issues}
                    </span>
                    <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                      {sdg.share_pct}% demand
                    </div>
                  </div>
                </div>

                <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-2)' }}>
                  {sdg.target}
                </p>

                <div className="flex items-center justify-between text-xs pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: sdg.critical_issues > 0 ? '#dc2626' : 'var(--text-3)' }}>
                    <FiAlertCircle size={11} /> {sdg.critical_issues} Critical
                  </span>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--text-2)' }}>
                    Avg Urgency: <b>{sdg.avg_urgency}/10</b>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Section 2: Cross-Referenced Priority Deficit Matrix ── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>
              Public Investment Priority Deficit Matrix
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-3)' }}>
              Synthesizes <b>Citizen Demand Volume & Urgency</b> × <b>Infrastructure Index Deficit</b> × <b>Public Budget CapEx Gap</b>
            </p>
          </div>

          {/* Tier Filter Buttons */}
          <div className="flex items-center gap-1 p-1 rounded-lg self-start sm:self-auto" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
            {['all', 'critical', 'high'].map(t => (
              <button
                key={t}
                onClick={() => setSelectedTier(t)}
                className="px-2.5 py-1 text-xs font-semibold rounded capitalize transition-all"
                style={{
                  background: selectedTier === t ? 'var(--bg-card)' : 'transparent',
                  color: selectedTier === t ? 'var(--text-1)' : 'var(--text-3)',
                }}
              >
                {t === 'all' ? 'All Tiers' : `${t} Only`}
              </button>
            ))}
          </div>
        </div>

        {/* Matrix Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)' }}>
                  <th className="p-3 font-semibold" style={{ color: 'var(--text-2)' }}>Rank / Priority Tier</th>
                  <th className="p-3 font-semibold" style={{ color: 'var(--text-2)' }}>Country & Sector</th>
                  <th className="p-3 font-semibold" style={{ color: 'var(--text-2)' }}>Citizen Demand</th>
                  <th className="p-3 font-semibold" style={{ color: 'var(--text-2)' }}>Baseline Index</th>
                  <th className="p-3 font-semibold" style={{ color: 'var(--text-2)' }}>Annual CapEx</th>
                  <th className="p-3 font-semibold" style={{ color: 'var(--text-2)' }}>Deficit Score</th>
                  <th className="p-3 font-semibold" style={{ color: 'var(--text-2)' }}>Target SDG</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {filteredProjects.map((p, idx) => {
                  const isCritical = p.priority_tier.includes('Critical')
                  const isHigh = p.priority_tier.includes('High')
                  const tierColor = isCritical ? '#dc2626' : (isHigh ? '#d97706' : '#2563eb')
                  const tierBg = isCritical ? 'rgba(220,38,38,0.1)' : (isHigh ? 'rgba(217,119,6,0.1)' : 'rgba(37,99,235,0.1)')

                  return (
                    <tr key={`${p.country}-${p.category}`} className="hover:bg-opacity-50 transition-colors"
                        style={{ background: idx % 2 === 0 ? 'transparent' : 'var(--bg-card)' }}>
                      <td className="p-3">
                        <span className="badge font-mono" style={{ background: tierBg, color: tierColor, border: `1px solid ${tierColor}40` }}>
                          #{idx + 1} {p.priority_tier}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="font-bold" style={{ color: 'var(--text-1)' }}>{p.category}</div>
                        <div className="text-[11px]" style={{ color: 'var(--text-3)' }}>{p.country}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono font-semibold" style={{ color: 'var(--text-1)' }}>
                          {p.citizen_demand_count} requests
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                          Avg Urgency: {p.avg_urgency}/10 ({p.critical_count} critical)
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold" style={{ color: p.infrastructure_baseline_index < 60 ? '#dc2626' : '#16a34a' }}>
                            {p.infrastructure_baseline_index}/100
                          </span>
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                          {p.infrastructure_baseline_index < 60 ? 'Acute Deficit' : 'Standard Baseline'}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-mono font-bold" style={{ color: 'var(--text-1)' }}>
                          ${p.annual_budget_usd_bn}B USD
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>Public Budget</div>
                      </td>
                      <td className="p-3">
                        <div className="text-base font-bold font-mono" style={{ color: tierColor }}>
                          {p.priority_score}
                        </div>
                        <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>Out of 100</div>
                      </td>
                      <td className="p-3">
                        <span className="text-[11px] px-2 py-0.5 rounded font-medium"
                              style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                          {p.sdg}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

