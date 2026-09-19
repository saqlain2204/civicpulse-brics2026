import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  AreaChart, Area
} from 'recharts'

const PALETTE = ['#000000','#333333','#555555','#777777','#999999','#bbbbbb','#2563eb','#dc2626','#d97706','#16a34a']
const DARK_PALETTE = ['#ffffff','#cccccc','#aaaaaa','#888888','#666666','#444444','#60a5fa','#f87171','#fbbf24','#4ade80']

function isDark() {
  return document.documentElement.classList.contains('dark')
}

function palette() {
  return isDark() ? DARK_PALETTE : PALETTE
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-strong)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
      boxShadow: 'var(--shadow-lg)'
    }}>
      <p style={{ color: 'var(--text-1)', fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || 'var(--text-2)' }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

const SHORT = {
  'Roads & Transportation':   'Roads',
  'Water Supply & Sanitation':'Water',
  'Healthcare':               'Health',
  'Education':                'Education',
  'Electricity & Power':      'Electricity',
  'Digital Infrastructure':   'Digital',
  'Housing':                  'Housing',
  'Agriculture Support':      'Agriculture',
  'Public Safety':            'Safety',
  'Environmental':            'Environment',
}

export function CategoryBarChart({ data = [] }) {
  const p = palette()
  const d = data.map((item, i) => ({
    name: SHORT[item.category] || item.category,
    total: item.total,
    critical: item.critical,
    fill: p[i % p.length],
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={d} margin={{ top: 4, right: 8, left: -24, bottom: 55 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: 'var(--text-3)', fontSize: 10 }} angle={-40} textAnchor="end" interval={0} />
        <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="total" name="Total" radius={[4,4,0,0]}>
          {d.map((e, i) => <Cell key={i} fill={e.fill} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function UrgencyPieChart({ data = {} }) {
  const items = [
    { name: 'Critical', value: data.critical || 0, color: '#dc2626' },
    { name: 'High',     value: data.high    || 0, color: '#d97706' },
    { name: 'Medium',   value: data.medium  || 0, color: '#2563eb' },
    { name: 'Low',      value: data.low     || 0, color: '#16a34a' },
  ].filter(d => d.value > 0)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={items} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
          {items.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8}
                formatter={val => <span style={{ color: 'var(--text-2)', fontSize: 11 }}>{val}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function CountryRadarChart({ data = {} }) {
  const countries = Object.keys(data)
  if (!countries.length) return null

  const cats = ['Roads & Transportation','Healthcare','Water Supply & Sanitation','Digital Infrastructure','Education']
  const radarData = cats.map(cat => {
    const entry = { category: SHORT[cat] || cat }
    countries.forEach(c => {
      entry[c] = Math.min(100, (data[c]?.categories?.[cat]?.count || 0) * 5)
    })
    return entry
  })

  const COUNTRY_COLORS = { India:'#d97706', Brazil:'#16a34a', Russia:'#2563eb', China:'#dc2626', 'South Africa':'#7c3aed' }
  const p = palette()

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={radarData}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="category" tick={{ fill: 'var(--text-3)', fontSize: 10 }} />
        {countries.map((c, i) => (
          <Radar key={c} name={c} dataKey={c}
            stroke={COUNTRY_COLORS[c] || p[i]}
            fill={COUNTRY_COLORS[c] || p[i]}
            fillOpacity={0.08} strokeWidth={1.5} />
        ))}
        <Legend formatter={val => <span style={{ color: 'var(--text-2)', fontSize: 11 }}>{val}</span>} />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  )
}

export function TrendLineChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="var(--text-1)" stopOpacity={0.15} />
            <stop offset="95%" stopColor="var(--text-1)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="week" tick={{ fill: 'var(--text-3)', fontSize: 10 }} />
        <YAxis tick={{ fill: 'var(--text-3)', fontSize: 10 }} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="count" name="Submissions"
              stroke="var(--text-1)" fill="url(#tg)" strokeWidth={1.5} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
