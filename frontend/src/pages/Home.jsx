import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiMessageSquare, FiMap, FiMic, FiZap, FiGlobe, FiShield, FiTrendingUp, FiBarChart2 } from 'react-icons/fi'
import { getDashboardStats } from '../api'

const BRICS = [
  { flag: 'IN', country: 'India' },
  { flag: 'BR', country: 'Brazil' },
  { flag: 'RU', country: 'Russia' },
  { flag: 'CN', country: 'China' },
  { flag: 'ZA', country: 'South Africa' },
]

const LIVE_FEED = [
  { cat: 'Water Supply', loc: 'Mumbai, India',        score: 9, lang: 'Hindi' },
  { cat: 'Roads',        loc: 'São Paulo, Brazil',    score: 8, lang: 'Portuguese' },
  { cat: 'Healthcare',   loc: 'Johannesburg, S.A.',   score: 9, lang: 'Zulu' },
  { cat: 'Digital',      loc: 'Chengdu, China',       score: 7, lang: 'Chinese' },
  { cat: 'Electricity',  loc: 'Novosibirsk, Russia',  score: 8, lang: 'Russian' },
  { cat: 'Education',    loc: 'Cape Town, S.A.',      score: 7, lang: 'English' },
]

function UrgencyDot({ score }) {
  const color = score >= 9 ? '#dc2626' : score >= 7 ? '#d97706' : '#2563eb'
  return <span style={{ width:7, height:7, borderRadius:'50%', background:color, display:'inline-block', flexShrink:0 }} />
}

function AnimatedFeed() {
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIdx(i => (i + 1) % LIVE_FEED.length)
        setVisible(true)
      }, 350)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  const item = LIVE_FEED[idx]
  return (
    <div style={{
      transition: 'opacity 0.35s, transform 0.35s',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(8px)',
    }} className="flex items-center gap-3 py-2.5 px-3 rounded-lg"
       style2={{ background: 'var(--bg-hover)' }}>
      <UrgencyDot score={item.score} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-1)' }}>{item.cat}</div>
        <div className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{item.loc}</div>
      </div>
      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-2)', color: 'var(--text-3)', fontSize:10 }}>
        {item.lang}
      </span>
    </div>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div className="card p-4">
      <div className="text-2xl font-bold mb-0.5" style={{ color: 'var(--text-1)' }}>{value}</div>
      <div className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{label}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{sub}</div>}
    </div>
  )
}

/* Animated right panel */
function HeroVisual({ stats }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Background subtle grid */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden" style={{ background: 'var(--bg-2)' }}>
        <svg width="100%" height="100%" style={{ opacity: 0.4 }}>
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="var(--border-strong)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Main dashboard card */}
      <div className="relative z-10 w-full max-w-sm mx-auto px-4">
        {/* Header bar */}
        <div className="card p-3.5 mb-3 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>Infrastructure Demand — Live</span>
            <span className="flex items-center gap-1.5 text-xs" style={{ color: '#16a34a' }}>
              <span className="live-dot" /> Active
            </span>
          </div>
          {/* Mini bar chart */}
          <div className="flex items-end gap-1 h-10">
            {[55, 80, 45, 95, 60, 88, 70, 100, 65, 78, 90, 55].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm transition-all"
                   style={{
                     height: `${h}%`,
                     background: i === 7 ? 'var(--text-1)' : 'var(--border-strong)',
                     animation: `fadeUp 0.5s ease ${i * 0.06}s both`,
                   }} />
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 mb-3 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <StatCard label="Submissions" value={stats?.total_feedback?.toLocaleString() ?? '—'} sub="across 5 nations" />
          <StatCard label="Critical Issues" value={stats?.critical_issues?.toLocaleString() ?? '—'} sub="urgency 8+" />
        </div>

        {/* Live feed */}
        <div className="card p-3 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>Live Submissions</span>
            <span className="live-dot ml-auto" />
          </div>
          <AnimatedFeed />
          <div className="mt-1 space-y-1">
            {LIVE_FEED.slice(1, 3).map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 py-1.5 px-2 rounded"
                   style={{ background: 'var(--bg-2)', opacity: 0.5 - i * 0.15 }}>
                <UrgencyDot score={item.score} />
                <span className="text-xs truncate" style={{ color: 'var(--text-3)' }}>{item.cat} — {item.loc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* BRICS nation flags */}
        <div className="flex items-center justify-center gap-2 mt-3 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          {BRICS.map(({ country }) => (
            <span key={country} className="text-xs px-2 py-1 rounded-md" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-3)' }}>
              {country.split(' ')[0]}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

const features = [
  { icon: FiMic,        title: 'Voice & Multilingual',  desc: 'Whisper transcribes submissions in Hindi, Portuguese, Russian, Chinese, Zulu and more.' },
  { icon: FiMap,        title: 'Demand Heatmaps',       desc: 'Interactive maps surface infrastructure gaps across all BRICS nations in real time.' },
  { icon: FiZap,        title: 'Urgency Scoring',       desc: 'AI classifies each submission — category, sentiment, and urgency 1–10 — instantly.' },
  { icon: FiTrendingUp, title: 'Policy Recommendations',desc: 'LLM-generated, SDG-aligned investment recommendations for national policymakers.' },
  { icon: FiShield,     title: 'Digital Public Good',   desc: 'Open-source, privacy-first, no vendor lock-in. Built for equitable governance.' },
  { icon: FiGlobe,      title: 'Cross-Nation Analytics',desc: 'Radar charts compare infrastructure demand intensity across all 5 BRICS nations.' },
]

export default function Home() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    getDashboardStats().then(r => setStats(r.data)).catch(() => {})
  }, [])

  return (
    <div style={{ background: 'var(--bg)' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[520px]">

          {/* Left column */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
                 style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
              <span className="live-dot" />
              Track 1 — AI for Digital Public Infrastructure
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-6"
                style={{ color: 'var(--text-1)' }}>
              Every voice.<br />
              Every need.<br />
              <span style={{ color: 'var(--text-3)' }}>Every nation.</span>
            </h1>

            <p className="text-base sm:text-lg mb-8 max-w-lg leading-relaxed" style={{ color: 'var(--text-2)' }}>
              CivicPulse aggregates citizen infrastructure requests across BRICS nations via voice,
              text and messaging apps — turning community voices into national policy decisions.
            </p>

            <div className="flex flex-wrap gap-3 mb-12">
              <Link to="/submit" className="btn-primary">
                <FiMessageSquare size={15} /> Submit Feedback
              </Link>
              <Link to="/dashboard" className="btn-secondary">
                <FiBarChart2 size={15} /> Policy Dashboard <FiArrowRight size={14} />
              </Link>
            </div>

            {/* Stat strip */}
            {stats && (
              <div className="flex flex-wrap gap-6">
                {[
                  { label: 'Citizen submissions', value: stats.total_feedback?.toLocaleString() },
                  { label: 'Critical issues', value: stats.critical_issues?.toLocaleString() },
                  { label: 'Implemented', value: stats.implemented?.toLocaleString() },
                  { label: 'Nations covered', value: '5' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-2xl font-bold" style={{ color: 'var(--text-1)' }}>{value}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column — animated visual */}
          <div className="h-[480px] lg:h-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <HeroVisual stats={stats} />
          </div>
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────── */}
      <hr className="divider max-w-6xl mx-auto" />

      {/* ── How it works ─────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-1)' }}>How it works</h2>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>From citizen voice to national policy in four steps</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '01', title: 'Citizens Speak',    desc: 'Voice, text or messaging app in any BRICS language' },
            { step: '02', title: 'AI Analyzes',       desc: 'Classifies urgency, translates, extracts intent' },
            { step: '03', title: 'Hotspots Form',     desc: 'Geographic demand clusters appear on live maps' },
            { step: '04', title: 'Policies Respond',  desc: 'AI recommendations guide infrastructure spending' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="card p-5">
              <div className="text-xs font-mono mb-3" style={{ color: 'var(--text-3)' }}>{step}</div>
              <h3 className="font-semibold mb-1.5" style={{ color: 'var(--text-1)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <hr className="divider max-w-6xl mx-auto" />

      {/* ── Features ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-1)' }}>Platform capabilities</h2>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>Built as a Digital Public Good for BRICS governance</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5 hover:shadow-lg transition-shadow">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-4"
                   style={{ background: 'var(--bg-2)', color: 'var(--text-1)' }}>
                <Icon size={16} />
              </div>
              <h3 className="font-semibold mb-1.5 text-sm" style={{ color: 'var(--text-1)' }}>{title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 pb-24">
        <div className="card p-10 text-center">
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-1)' }}>
            Shape infrastructure policy with data
          </h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: 'var(--text-2)' }}>
            Join millions of BRICS citizens whose voices directly influence national infrastructure investments.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/submit" className="btn-primary"><FiMic size={14} /> Report an Issue</Link>
            <Link to="/dashboard" className="btn-secondary"><FiBarChart2 size={14} /> View Dashboard</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
