import { useState, useEffect } from 'react'
import { FiUsers, FiAlertTriangle, FiCheckCircle, FiTrendingUp, FiRefreshCw } from 'react-icons/fi'
import { getDashboardStats, getHotspots, getCategoryBreakdown, getCountryComparison } from '../api'
import HeatMap from '../components/map/HeatMap'
import { CategoryBarChart, UrgencyPieChart, CountryRadarChart } from '../components/charts/CategoryChart'
import AIRecommendations from '../components/AIRecommendations'

const COUNTRIES = ['India', 'Brazil', 'Russia', 'China', 'South Africa']

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
             style={{ background: 'var(--bg-2)', color: 'var(--text-1)' }}>
          <Icon size={16} />
        </div>
      </div>
      <div className="text-2xl font-bold mb-0.5" style={{ color: 'var(--text-1)' }}>{value ?? '—'}</div>
      <div className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>{label}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{sub}</div>}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [hotspots, setHotspots] = useState([])
  const [categories, setCategories] = useState([])
  const [countries, setCountries] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [filterCountry, setFilterCountry] = useState('')
  const [minUrgency, setMinUrgency] = useState(1)

  const load = async () => {
    setLoading(true)
    try {
      const [s, h, c, co] = await Promise.all([
        getDashboardStats(),
        getHotspots({ min_urgency: minUrgency, country: filterCountry || undefined }),
        getCategoryBreakdown(filterCountry || undefined),
        getCountryComparison(),
      ])
      setStats(s.data); setHotspots(h.data.points)
      setCategories(c.data.data); setCountries(co.data.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [filterCountry, minUrgency])

  const tabs = [
    { id: 'overview',  label: 'Overview' },
    { id: 'map',       label: 'Heatmap' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'ai',        label: 'AI Insights' },
  ]

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>Policy Dashboard</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>Real-time BRICS infrastructure demand intelligence</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
              className="input-field appearance-none text-sm" style={{ width: 'auto', padding: '7px 12px' }}>
              <option value="">All nations</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={minUrgency} onChange={e => setMinUrgency(Number(e.target.value))}
              className="input-field appearance-none text-sm" style={{ width: 'auto', padding: '7px 12px' }}>
              <option value={1}>All urgency</option>
              <option value={4}>Medium+ (4+)</option>
              <option value={7}>High+ (7+)</option>
              <option value={9}>Critical (9+)</option>
            </select>
            <button onClick={load} className="btn-secondary" style={{ padding: '7px 12px' }}>
              <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-2 mb-6 text-xs" style={{ color: 'var(--text-3)' }}>
          <span className="live-dot" /> Live — updates as citizens submit
        </div>

        {/* Stat cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={FiUsers}        label="Total submissions" value={stats.total_feedback?.toLocaleString()} sub="All BRICS nations" />
            <StatCard icon={FiAlertTriangle} label="Critical issues"   value={stats.critical_issues?.toLocaleString()} sub="Urgency 8 or above" />
            <StatCard icon={FiCheckCircle}  label="Implemented"       value={stats.implemented?.toLocaleString()} sub="Projects completed" />
            <StatCard icon={FiTrendingUp}   label="Satisfaction"      value={`${stats.satisfaction_rate}%`} sub="Positive feedback" />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1" style={{ borderBottom: '1px solid var(--border)' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className="flex-shrink-0 px-4 py-2 text-sm font-medium transition-colors rounded-t-lg -mb-px"
              style={{
                color: activeTab === t.id ? 'var(--text-1)' : 'var(--text-3)',
                borderBottom: activeTab === t.id ? '2px solid var(--text-1)' : '2px solid transparent',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && stats && (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 card p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Issues by category</h3>
              <CategoryBarChart data={categories} />
            </div>
            <div className="card p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Urgency distribution</h3>
              <UrgencyPieChart data={stats.urgency_distribution} />
              <div className="mt-4 space-y-2">
                {[
                  { label: 'Critical', count: stats.urgency_distribution?.critical || 0, color: '#dc2626' },
                  { label: 'High',     count: stats.urgency_distribution?.high    || 0, color: '#d97706' },
                  { label: 'Medium',   count: stats.urgency_distribution?.medium  || 0, color: '#2563eb' },
                  { label: 'Low',      count: stats.urgency_distribution?.low     || 0, color: '#16a34a' },
                ].map(({ label, count, color }) => {
                  const pct = stats.total_feedback > 0 ? (count / stats.total_feedback * 100) : 0
                  return (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-xs w-14" style={{ color: 'var(--text-3)' }}>{label}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-2)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, transition: 'width 0.8s ease' }} />
                      </div>
                      <span className="text-xs w-6 text-right" style={{ color: 'var(--text-3)' }}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Map tab */}
        {activeTab === 'map' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-3)' }}>
              <span>Click any pin to see what was reported</span>
              <span>{hotspots.length} points shown</span>
            </div>
            <HeatMap points={hotspots} showClusters height="560px" />
            <div className="card p-4">
              <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--text-2)' }}>
                <span className="font-medium">Pin urgency:</span>
                {[
                  { label: 'Critical (9-10)', color: '#dc2626' },
                  { label: 'High (7-8)',      color: '#d97706' },
                  { label: 'Medium (4-6)',    color: '#2563eb' },
                  { label: 'Low (1-3)',       color: '#16a34a' },
                ].map(({ label, color }) => (
                  <span key={label} className="flex items-center gap-1.5">
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Cross-nation demand radar</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>Infrastructure demand intensity across BRICS nations</p>
              <CountryRadarChart data={countries} />
            </div>
            <div className="card p-5 overflow-x-auto">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-1)' }}>Country breakdown</h3>
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Nation', 'Submissions', 'Top Category', 'Avg Urgency'].map(h => (
                      <th key={h} className="text-left pb-2.5 pr-6 text-xs font-medium" style={{ color: 'var(--text-3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(countries).map(([country, data]) => {
                    const topCat = Object.entries(data.categories || {}).sort((a, b) => b[1].count - a[1].count)[0]
                    return (
                      <tr key={country} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td className="py-3 pr-6 font-medium" style={{ color: 'var(--text-1)' }}>{country}</td>
                        <td className="py-3 pr-6" style={{ color: 'var(--text-2)' }}>{data.total}</td>
                        <td className="py-3 pr-6 text-xs" style={{ color: 'var(--text-2)' }}>{topCat?.[0] || '—'}</td>
                        <td className="py-3" style={{ color: topCat?.[1]?.avg_urgency >= 7 ? '#d97706' : '#16a34a' }}>
                          {topCat?.[1]?.avg_urgency || '—'}/10
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ai' && <AIRecommendations />}
      </div>
    </div>
  )
}
