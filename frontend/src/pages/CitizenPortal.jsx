import { useState, useRef } from 'react'
import { FiMic, FiMicOff, FiSend, FiCheckCircle, FiZap } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { submitFeedback, analyzeText } from '../api'

const COUNTRIES = [
  { value: 'India',        label: 'India',        cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Jaipur', 'Pune'] },
  { value: 'Brazil',       label: 'Brazil',       cities: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Manaus', 'Recife'] },
  { value: 'Russia',       label: 'Russia',       cities: ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan', 'Omsk'] },
  { value: 'China',        label: 'China',        cities: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Wuhan', "Xi'an"] },
  { value: 'South Africa', label: 'South Africa', cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth'] },
]

const CITY_COORDS = {
  'Mumbai': [19.076, 72.877], 'Delhi': [28.613, 77.209], 'Bangalore': [12.971, 77.594],
  'Chennai': [13.082, 80.270], 'Hyderabad': [17.385, 78.486], 'Kolkata': [22.572, 88.363],
  'Jaipur': [26.912, 75.787], 'Pune': [18.520, 73.856],
  'São Paulo': [-23.550, -46.633], 'Rio de Janeiro': [-22.906, -43.172], 'Brasília': [-15.826, -47.921],
  'Salvador': [-12.971, -38.501], 'Fortaleza': [-3.717, -38.543], 'Manaus': [-3.119, -60.021],
  'Moscow': [55.755, 37.617], 'Saint Petersburg': [59.934, 30.335], 'Novosibirsk': [54.983, 82.896],
  'Yekaterinburg': [56.838, 60.605], 'Kazan': [55.788, 49.122], 'Omsk': [54.988, 73.324],
  'Beijing': [39.904, 116.407], 'Shanghai': [31.230, 121.473], 'Guangzhou': [23.129, 113.264],
  'Shenzhen': [22.543, 114.057], 'Chengdu': [30.572, 104.066], 'Wuhan': [30.592, 114.305],
  "Xi'an": [34.341, 108.939],
  'Johannesburg': [-26.204, 28.047], 'Cape Town': [-33.924, 18.424], 'Durban': [-29.858, 31.021],
  'Pretoria': [-25.746, 28.188], 'Port Elizabeth': [-33.960, 25.602],
}

const EXAMPLES = [
  { lang: 'Hindi',      text: 'हमारे गांव में पानी की भारी कमी है। तीन महीनों से नल में पानी नहीं आया।' },
  { lang: 'Portuguese', text: 'As estradas da nossa comunidade estão destruídas. Precisamos de reparos urgentes.' },
  { lang: 'Russian',    text: 'Дороги в нашем районе требуют срочного ремонта.' },
  { lang: 'Chinese',    text: '农村地区网络基础设施急需改善，学生无法参加网络课程。' },
  { lang: 'Zulu',       text: 'Imigwaqo yasemakhaya iyashaywa kabi futhi idinga ukuphashwa.' },
]

function UrgencyBadge({ score }) {
  if (!score) return null
  const { cls, label } = score >= 9 ? { cls: 'badge-critical', label: 'Critical' }
    : score >= 7 ? { cls: 'badge-high', label: 'High' }
    : score >= 4 ? { cls: 'badge-medium', label: 'Medium' }
    : { cls: 'badge-low', label: 'Low' }
  return <span className={`badge ${cls}`}>{label} {score}/10</span>
}

export default function CitizenPortal() {
  const [text, setText] = useState('')
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [source, setSource] = useState('web')
  const [isRecording, setIsRecording] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [liveAnalysis, setLiveAnalysis] = useState(null)
  const [submitted, setSubmitted] = useState(null)
  const analyzeTimer = useRef(null)
  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])

  const selectedCountry = COUNTRIES.find(c => c.value === country)

  const handleTextChange = (val) => {
    setText(val)
    setLiveAnalysis(null)
    clearTimeout(analyzeTimer.current)
    if (val.length > 20) {
      analyzeTimer.current = setTimeout(async () => {
        setIsAnalyzing(true)
        try { const res = await analyzeText(val); setLiveAnalysis(res.data.analysis) } catch {}
        setIsAnalyzing(false)
      }, 1400)
    }
  }

  const handleRecord = async () => {
    if (isRecording) { mediaRecorder.current?.stop(); setIsRecording(false); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunks.current = []
      const mr = new MediaRecorder(stream)
      mediaRecorder.current = mr
      mr.ondataavailable = e => audioChunks.current.push(e.data)
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        toast.success('Voice recorded. Edit text if needed then submit.')
      }
      mr.start()
      setIsRecording(true)
      setSource('voice')
      toast('Recording started — speak your concern.')
    } catch { toast.error('Microphone access denied.') }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim() || !country) { toast.error('Please enter feedback and select your country.'); return }
    setIsSubmitting(true)
    try {
      const coords = CITY_COORDS[city] || [0, 0]
      const res = await submitFeedback({ text, country, region: '', city, lat: coords[0], lng: coords[1], source, language: 'auto' })
      setSubmitted(res.data)
      setText('')
      setLiveAnalysis(null)
      toast.success('Feedback submitted successfully.')
    } catch { toast.error('Submission failed. Please try again.') }
    setIsSubmitting(false)
  }

  if (submitted) {
    const ai = submitted.ai_analysis
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="card max-w-md w-full p-8 text-center animate-fade-up">
          <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center"
               style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)' }}>
            <FiCheckCircle size={24} style={{ color: '#16a34a' }} />
          </div>
          <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>Submitted</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-2)' }}>Your feedback has been received and analyzed.</p>

          <div className="space-y-2.5 text-left mb-6">
            {[
              { label: 'Category', value: ai?.category },
              { label: 'Language detected', value: ai?.language_name || 'English' },
              { label: 'Status', value: 'Pending review' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2.5 px-3 rounded-lg"
                   style={{ background: 'var(--bg-2)' }}>
                <span className="text-sm" style={{ color: 'var(--text-2)' }}>{label}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-2.5 px-3 rounded-lg" style={{ background: 'var(--bg-2)' }}>
              <span className="text-sm" style={{ color: 'var(--text-2)' }}>Urgency</span>
              <UrgencyBadge score={ai?.urgency_score} />
            </div>
          </div>

          <button onClick={() => setSubmitted(null)} className="btn-primary w-full justify-center">
            Submit another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>Share your concern</h1>
          <p className="text-sm" style={{ color: 'var(--text-2)' }}>Report infrastructure issues in any language. Your feedback shapes national policy.</p>
        </div>

        {/* Example texts */}
        <div className="mb-5">
          <p className="text-xs mb-2" style={{ color: 'var(--text-3)' }}>Try an example in another language:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map(({ lang, text: t }) => (
              <button key={lang} onClick={() => handleTextChange(t)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                {lang}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Text area */}
          <div className="card overflow-hidden p-0">
            <textarea
              value={text}
              onChange={e => handleTextChange(e.target.value)}
              placeholder="Describe the infrastructure issue in your community... (any language supported)"
              rows={5}
              className="w-full px-4 py-3.5 text-sm resize-none outline-none"
              style={{ background: 'transparent', color: 'var(--text-1)', fontFamily: 'inherit' }}
            />
            <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderTop: '1px solid var(--border)' }}>
              <button type="button" onClick={handleRecord}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: isRecording ? '#dc2626' : 'var(--bg-2)',
                  color: isRecording ? '#fff' : 'var(--text-2)',
                  border: '1px solid var(--border)',
                }}>
                {isRecording ? <><FiMicOff size={12} /> Stop</> : <><FiMic size={12} /> Voice input</>}
              </button>
              {isAnalyzing && (
                <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-3)' }}>
                  <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin inline-block" />
                  Analyzing...
                </span>
              )}
              <span className="ml-auto text-xs" style={{ color: 'var(--text-3)' }}>{text.length} chars</span>
            </div>
          </div>

          {/* Live AI analysis */}
          {liveAnalysis && (
            <div className="card p-4 animate-fade-in" style={{ borderColor: 'rgba(22,163,74,0.25)' }}>
              <div className="flex items-center gap-1.5 mb-3">
                <FiZap size={12} style={{ color: '#16a34a' }} />
                <span className="text-xs font-semibold" style={{ color: '#16a34a' }}>Live analysis</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Language',  value: liveAnalysis.language_name },
                  { label: 'Category',  value: liveAnalysis.category?.split(' ')[0] + (liveAnalysis.category?.includes('&') ? ' & ...' : '') },
                  { label: 'Sentiment', value: liveAnalysis.sentiment },
                  { label: 'Urgency',   value: null },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>{label}</div>
                    {label === 'Urgency'
                      ? <UrgencyBadge score={liveAnalysis.urgency_score} />
                      : <div className="text-xs font-semibold" style={{ color: 'var(--text-1)' }}>{value}</div>
                    }
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Country *</label>
              <select value={country} onChange={e => { setCountry(e.target.value); setCity('') }}
                className="input-field appearance-none">
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>City</label>
              <select value={city} onChange={e => setCity(e.target.value)}
                className="input-field appearance-none" disabled={!selectedCountry}>
                <option value="">Select city</option>
                {selectedCountry?.cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Channel */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>Channel</label>
            <div className="flex flex-wrap gap-2">
              {['web', 'whatsapp', 'sms', 'telegram'].map(s => (
                <button key={s} type="button" onClick={() => setSource(s)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors"
                  style={{
                    background: source === s ? 'var(--accent)' : 'var(--bg-2)',
                    color: source === s ? 'var(--accent-inv)' : 'var(--text-2)',
                    border: `1px solid ${source === s ? 'var(--accent)' : 'var(--border)'}`,
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={isSubmitting || !text.trim() || !country}
            className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed">
            {isSubmitting
              ? <><span className="w-4 h-4 rounded-full border border-current border-t-transparent animate-spin" /> Submitting...</>
              : <><FiSend size={14} /> Submit feedback</>}
          </button>
        </form>

        <p className="text-center text-xs mt-5" style={{ color: 'var(--text-3)' }}>
          Submissions are anonymized. No personal data is stored.
        </p>
      </div>
    </div>
  )
}
