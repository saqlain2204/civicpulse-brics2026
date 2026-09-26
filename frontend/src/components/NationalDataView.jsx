import { useState, useEffect } from 'react'
import { FiGlobe, FiDollarSign, FiActivity, FiUsers, FiCpu, FiTrendingDown, FiShield, FiCheck } from 'react-icons/fi'
import { getNationalData } from '../api'

const BRICS_COUNTRIES = ['India', 'Brazil', 'Russia', 'China', 'South Africa']

export default function NationalDataView({ defaultCountry = '' }) {
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry || 'India')
  const [allData, setAllData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (defaultCountry && defaultCountry !== selectedCountry) {
      setSelectedCountry(defaultCountry)
    }
  }, [defaultCountry])

  useEffect(() => {
    setLoading(true)
    getNationalData(selectedCountry)
      .then(res => {
        if (res.data?.data) {
          setAllData(res.data.data)
        } else if (res.data?.countries?.[selectedCountry]) {
          setAllData(res.data.countries[selectedCountry])
        }
      })
      .catch(err => console.error('Failed to load national data:', err))
      .finally(() => setLoading(false))
  }, [selectedCountry])

  if (loading || !allData) {
    return (
      <div className="card p-12 text-center">
        <div className="w-8 h-8 rounded-full border border-current border-t-transparent animate-spin mx-auto mb-3"
             style={{ color: 'var(--text-3)' }} />
        <p className="text-sm" style={{ color: 'var(--text-2)' }}>Loading national demographic & infrastructure datasets...</p>
      </div>
    )
  }

  const { demographics, infrastructure_indices, public_investment_plans } = allData

  return (
    <div className="space-y-6">
      {/* Country Switcher Strip */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-1)' }}>
            National Demographic & Infrastructure Baselines
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>
            Cross-referenced with citizen feedback to eliminate public spending misalignment
          </p>
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-lg" style={{ background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
          {BRICS_COUNTRIES.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCountry(c)}
              className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
              style={{
                background: selectedCountry === c ? 'var(--bg-card)' : 'transparent',
                color: selectedCountry === c ? 'var(--text-1)' : 'var(--text-3)',
                boxShadow: selectedCountry === c ? 'var(--shadow)' : 'none',
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Demographics Overview Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="card p-3">
          <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--text-3)' }}>
            <FiUsers size={12} /> Population
          </div>
          <div className="text-base font-bold" style={{ color: 'var(--text-1)' }}>
            {(demographics.population / 1e6).toFixed(1)}M
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>Census Verified</div>
        </div>

        <div className="card p-3">
          <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--text-3)' }}>
            <FiGlobe size={12} /> Urbanization
          </div>
          <div className="text-base font-bold" style={{ color: 'var(--text-1)' }}>
            {demographics.urbanization_pct}%
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>Urban Pop Share</div>
        </div>

        <div className="card p-3">
          <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--text-3)' }}>
            <FiActivity size={12} /> Human Dev. (HDI)
          </div>
          <div className="text-base font-bold" style={{ color: demographics.hdi >= 0.75 ? '#16a34a' : '#d97706' }}>
            {demographics.hdi}
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>UNDP Benchmark</div>
        </div>

        <div className="card p-3">
          <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--text-3)' }}>
            <FiCpu size={12} /> Digital Access
          </div>
          <div className="text-base font-bold" style={{ color: 'var(--text-1)' }}>
            {demographics.internet_penetration_pct}%
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>Internet Penetration</div>
        </div>

        <div className="card p-3">
          <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--text-3)' }}>
            <FiTrendingDown size={12} /> Rural Exposure
          </div>
          <div className="text-base font-bold" style={{ color: '#dc2626' }}>
            {demographics.vulnerable_rural_pct}%
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>Vulnerable Areas</div>
        </div>

        <div className="card p-3">
          <div className="flex items-center gap-1.5 text-xs mb-1" style={{ color: 'var(--text-3)' }}>
            <FiDollarSign size={12} /> Annual CapEx
          </div>
          <div className="text-base font-bold" style={{ color: 'var(--text-1)' }}>
            ${public_investment_plans.annual_capex_usd_bn}B
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-3)' }}>Public Outlay</div>
        </div>
      </div>

      {/* Main Grid: Infrastructure Indices vs Public Investment Plans */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Infrastructure Baseline Index Scores */}
        <div className="lg:col-span-6 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>
                Infrastructure Quality & Access Index (0–100)
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                Scores below 60 represent acute national infrastructure deficit
              </p>
            </div>
            <span className="badge badge-critical text-[10px]">
              &lt;60 Deficit
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(infrastructure_indices).map(([cat, score]) => {
              const isDeficit = score < 60
              const barColor = score >= 75 ? '#16a34a' : score >= 60 ? '#2563eb' : score >= 45 ? '#d97706' : '#dc2626'
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium" style={{ color: 'var(--text-1)' }}>
                      {cat}
                    </span>
                    <span className="font-mono font-bold" style={{ color: barColor }}>
                      {score}/100 {isDeficit && <span className="text-[10px] text-red-500 font-sans ml-1">(Deficit)</span>}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-2)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${score}%`,
                        background: barColor,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Flagship Public Investment Plans & Budgets */}
        <div className="lg:col-span-6 space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold" style={{ color: 'var(--text-1)' }}>
                Approved Public Investment Plans & Flagships
              </h3>
              <span className="badge badge-medium text-[10px]">
                {public_investment_plans.funding_mechanism}
              </span>
            </div>

            <div className="space-y-2.5">
              {public_investment_plans.national_flagship_schemes.map((plan, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border transition-all"
                  style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold" style={{ color: 'var(--text-1)' }}>
                      {plan.name}
                    </span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded" style={{ background: 'var(--bg-card)', color: '#16a34a' }}>
                      ${plan.budget_usd_bn}B USD
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {plan.target_sectors.map(sec => (
                      <span
                        key={sec}
                        className="text-[10px] px-2 py-0.5 rounded"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                      >
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sector Budget Allocation Bar Breakdown */}
          <div className="card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>
              Annual Capital Outlay by Category (USD Billion)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(public_investment_plans.sector_budgets_usd_bn).slice(0, 6).map(([sec, bud]) => (
                <div key={sec} className="flex items-center justify-between p-2 rounded" style={{ background: 'var(--bg-2)' }}>
                  <span className="truncate pr-2" style={{ color: 'var(--text-2)' }}>{sec}</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--text-1)' }}>${bud}B</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

