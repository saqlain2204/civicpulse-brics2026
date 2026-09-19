import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'                    // attaches L.heatLayer to Leaflet — must be static import
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'

// Fix Leaflet's broken default icon paths when bundled with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function urgencyMeta(score) {
  if (score >= 9) return { fill: '#dc2626', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.3)', label: 'Critical' }
  if (score >= 7) return { fill: '#d97706', bg: 'rgba(217,119,6,0.1)',  border: 'rgba(217,119,6,0.3)',  label: 'High' }
  if (score >= 4) return { fill: '#2563eb', bg: 'rgba(37,99,235,0.1)',  border: 'rgba(37,99,235,0.3)',  label: 'Medium' }
  return              { fill: '#16a34a', bg: 'rgba(22,163,74,0.1)',   border: 'rgba(22,163,74,0.3)',  label: 'Low' }
}

function makePinIcon(score) {
  const { fill } = urgencyMeta(score)
  const size = score >= 9 ? 16 : score >= 7 ? 13 : 10
  const pulse = score >= 8
    ? `<div style="position:absolute;inset:-5px;border-radius:50%;border:2px solid ${fill};opacity:0.3;animation:pulse-ring 2s ease-out infinite;"></div>`
    : ''
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      <div style="width:${size}px;height:${size}px;border-radius:50%;background:${fill};border:2px solid rgba(255,255,255,0.9);box-shadow:0 2px 8px rgba(0,0,0,0.4);position:relative;z-index:2;"></div>
      ${pulse}
    </div>`,
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor:[0, -(size / 2 + 6)],
  })
}

/* ── Heatmap layer (L.heatLayer is available after the static import above) ── */
function HeatLayer({ points }) {
  const map = useMap()
  const layerRef = useRef(null)

  useEffect(() => {
    if (!points.length) return

    // Remove previous layer
    if (layerRef.current) {
      try { map.removeLayer(layerRef.current) } catch {}
      layerRef.current = null
    }

    const heatPoints = points.map(p => [p.lat, p.lng, p.intensity ?? 0.5])

    layerRef.current = L.heatLayer(heatPoints, {
      radius:     32,
      blur:       24,
      maxZoom:    10,
      minOpacity: 0.3,
      gradient:   { 0.25: '#2563eb', 0.5: '#d97706', 0.8: '#dc2626', 1.0: '#7f1d1d' },
    })
    layerRef.current.addTo(map)

    return () => {
      if (layerRef.current) {
        try { map.removeLayer(layerRef.current) } catch {}
      }
    }
  }, [points, map])

  return null
}

/* ── Pin popup content ─────────────────────────────────────────────────────── */
function PinPopup({ p }) {
  const u = urgencyMeta(p.urgency)
  return (
    <div style={{ width: 210, padding: '12px 14px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-1)', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1.3, flex: 1 }}>
          {p.category}
        </span>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, whiteSpace: 'nowrap',
          background: u.bg, color: u.fill, border: `1px solid ${u.border}` }}>
          {u.label} · {p.urgency}/10
        </span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>
        {[p.city, p.country].filter(Boolean).join(', ')}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
        Sentiment:&nbsp;
        <strong style={{ color: p.sentiment === 'negative' ? '#dc2626' : p.sentiment === 'positive' ? '#16a34a' : 'var(--text-3)' }}>
          {p.sentiment}
        </strong>
      </div>
    </div>
  )
}

/* ── Main export ───────────────────────────────────────────────────────────── */
export default function HeatMap({ points = [], showClusters = false, height = '500px' }) {
  return (
    <div style={{ height, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <MapContainer
        center={[20, 55]}
        zoom={3}
        minZoom={2}
        maxZoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom>

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Heatmap overlay */}
        {points.length > 0 && <HeatLayer points={points} />}

        {/* Clustered pins */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          showCoverageOnHover={false}
          disableClusteringAtZoom={showClusters ? 7 : undefined}>
          {points.map((p, i) => (
            <Marker
              key={`${p.lat}-${p.lng}-${i}`}
              position={[p.lat, p.lng]}
              icon={makePinIcon(p.urgency)}>
              <Popup>
                <PinPopup p={p} />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

      </MapContainer>
    </div>
  )
}
