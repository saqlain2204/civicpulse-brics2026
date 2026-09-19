import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'   // UMD side-effect — attaches L.heatLayer after L is loaded

// ── Fix Vite-bundled default icon paths ────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// ── Helpers ────────────────────────────────────────────────────────────────
function urgencyMeta(score) {
  if (score >= 9) return { fill: '#dc2626', bg: 'rgba(220,38,38,0.12)', border: 'rgba(220,38,38,0.4)', label: 'Critical' }
  if (score >= 7) return { fill: '#d97706', bg: 'rgba(217,119,6,0.12)',  border: 'rgba(217,119,6,0.4)',  label: 'High' }
  if (score >= 4) return { fill: '#2563eb', bg: 'rgba(37,99,235,0.12)',  border: 'rgba(37,99,235,0.4)',  label: 'Medium' }
  return              { fill: '#16a34a', bg: 'rgba(22,163,74,0.12)',   border: 'rgba(22,163,74,0.4)',  label: 'Low' }
}

function makePinIcon(score) {
  const { fill } = urgencyMeta(score)
  const size = score >= 9 ? 16 : score >= 7 ? 13 : 10
  const pulse = score >= 8
    ? `<div style="position:absolute;inset:-6px;border-radius:50%;border:2px solid ${fill};opacity:0.35;animation:pulse-ring 2s ease-out infinite;"></div>`
    : ''
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      ${pulse}
      <div style="width:${size}px;height:${size}px;border-radius:50%;background:${fill};border:2.5px solid rgba(255,255,255,0.9);box-shadow:0 2px 8px rgba(0,0,0,0.45);position:relative;z-index:2;"></div>
    </div>`,
    iconSize:    [size, size],
    iconAnchor:  [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 8)],
  })
}

// ── Inner components (must live inside MapContainer) ───────────────────────

/** Draws the heatmap overlay using leaflet.heat */
function HeatLayer({ points }) {
  const map = useMap()
  const layerRef = useRef(null)

  useEffect(() => {
    if (layerRef.current) {
      try { map.removeLayer(layerRef.current) } catch (_) {}
      layerRef.current = null
    }
    if (!points.length) return

    const heatPoints = points.map(p => [p.lat, p.lng, p.intensity ?? 0.5])
    layerRef.current = L.heatLayer(heatPoints, {
      radius:     32,
      blur:       24,
      maxZoom:    10,
      minOpacity: 0.25,
      gradient:   { 0.25: '#2563eb', 0.5: '#d97706', 0.8: '#dc2626', 1.0: '#7f1d1d' },
    }).addTo(map)

    return () => {
      if (layerRef.current) {
        try { map.removeLayer(layerRef.current) } catch (_) {}
        layerRef.current = null
      }
    }
  }, [points, map])

  return null
}

/** Calls map.invalidateSize() after a short delay so tiles fill correctly
 *  when the map was hidden (display:none) on first render */
function SizeGuard() {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150)
    return () => clearTimeout(t)
  }, [map])
  return null
}

/** Popup content for a single pin */
function PinPopup({ p }) {
  const u = urgencyMeta(p.urgency)
  return (
    <div style={{ width: 215, padding: '12px 14px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#111', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.3, flex: 1 }}>
          {p.category || 'Unknown'}
        </span>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, whiteSpace: 'nowrap',
          background: u.bg, color: u.fill, border: `1px solid ${u.border}` }}>
          {u.label} · {p.urgency}/10
        </span>
      </div>
      {(p.city || p.country) && (
        <div style={{ fontSize: 12, color: '#555', marginBottom: 6 }}>
          {[p.city, p.country].filter(Boolean).join(', ')}
        </div>
      )}
      {p.sentiment && (
        <div style={{ fontSize: 11, color: '#888' }}>
          Sentiment:&nbsp;
          <strong style={{ color: p.sentiment === 'negative' ? '#dc2626' : p.sentiment === 'positive' ? '#16a34a' : '#888' }}>
            {p.sentiment}
          </strong>
        </div>
      )}
      {p.summary && (
        <div style={{ fontSize: 11, color: '#666', marginTop: 6, borderTop: '1px solid #eee', paddingTop: 6 }}>
          {p.summary}
        </div>
      )}
    </div>
  )
}

// ── Public component ───────────────────────────────────────────────────────
export default function HeatMap({ points = [], height = '500px' }) {
  return (
    <div style={{ height, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <MapContainer
        center={[20, 55]}
        zoom={3}
        minZoom={2}
        maxZoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom>

        <SizeGuard />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Heat overlay */}
        {points.length > 0 && <HeatLayer points={points} />}

        {/* Individual pins */}
        {points.map((p, i) => (
          <Marker
            key={`${p.lat}-${p.lng}-${i}`}
            position={[p.lat, p.lng]}
            icon={makePinIcon(p.urgency ?? 3)}>
            <Popup><PinPopup p={p} /></Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  )
}
