import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css'

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function urgencyColor(score) {
  if (score >= 9) return { fill: '#dc2626', bg: 'rgba(220,38,38,0.12)', border: 'rgba(220,38,38,0.35)', label: 'Critical' }
  if (score >= 7) return { fill: '#d97706', bg: 'rgba(217,119,6,0.12)',  border: 'rgba(217,119,6,0.35)',  label: 'High' }
  if (score >= 4) return { fill: '#2563eb', bg: 'rgba(37,99,235,0.12)',  border: 'rgba(37,99,235,0.35)',  label: 'Medium' }
  return              { fill: '#16a34a', bg: 'rgba(22,163,74,0.12)',  border: 'rgba(22,163,74,0.35)',  label: 'Low' }
}

function makePinIcon(score) {
  const { fill } = urgencyColor(score)
  const size = score >= 9 ? 14 : score >= 7 ? 12 : 10
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        <div style="
          width:${size}px;height:${size}px;
          border-radius:50%;
          background:${fill};
          border:2px solid rgba(255,255,255,0.85);
          box-shadow:0 1px 6px rgba(0,0,0,0.35);
          position:relative;z-index:2;
        "></div>
        ${score >= 8 ? `<div style="
          position:absolute;inset:-4px;border-radius:50%;
          border:2px solid ${fill};opacity:0.35;
          animation:pulse-ring 2s ease-out infinite;
        "></div>` : ''}
      </div>`,
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor:[0, -(size / 2 + 4)],
  })
}

function HeatLayer({ points }) {
  const map = useMap()
  const ref = useRef(null)

  useEffect(() => {
    if (!points.length) return
    import('leaflet.heat').then(() => {
      if (ref.current) map.removeLayer(ref.current)
      ref.current = L.heatLayer(
        points.map(p => [p.lat, p.lng, p.intensity]),
        { radius: 30, blur: 22, maxZoom: 10, minOpacity: 0.3,
          gradient: { 0.25: '#2563eb', 0.5: '#d97706', 0.75: '#dc2626', 1.0: '#7f1d1d' } }
      )
      ref.current.addTo(map)
    }).catch(() => {})
    return () => { if (ref.current) { try { map.removeLayer(ref.current) } catch {} } }
  }, [points, map])

  return null
}

function PopupContent({ p }) {
  const uc = urgencyColor(p.urgency)
  return (
    <div style={{ width: 220, padding: '12px 14px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Category + urgency */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-1)', letterSpacing: '0.03em', textTransform: 'uppercase', lineHeight: 1.2, maxWidth: 130 }}>
          {p.category}
        </span>
        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99,
          background: uc.bg, color: uc.fill, border: `1px solid ${uc.border}`, flexShrink: 0 }}>
          {uc.label} {p.urgency}/10
        </span>
      </div>

      {/* Location */}
      <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6 }}>
        {p.city}{p.city && p.country ? ', ' : ''}{p.country}
      </div>

      {/* Sentiment */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Sentiment:</span>
        <span style={{ fontSize: 10, fontWeight: 600,
          color: p.sentiment === 'negative' ? '#dc2626' : p.sentiment === 'positive' ? '#16a34a' : 'var(--text-3)' }}>
          {p.sentiment}
        </span>
      </div>
    </div>
  )
}

export default function HeatMap({ points = [], showClusters = false, height = '500px' }) {
  const isDark = document.documentElement.classList.contains('dark')

  return (
    <div style={{ height, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <MapContainer
        center={[20, 60]} zoom={3} minZoom={2} maxZoom={15}
        style={{ height: '100%', width: '100%' }}
        zoomControl scrollWheelZoom>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <HeatLayer points={points} />
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          showCoverageOnHover={false}
          disableClusteringAtZoom={showClusters ? 6 : undefined}>
          {points.map((p, i) => (
            <Marker key={`${p.lat}-${p.lng}-${i}`}
                    position={[p.lat, p.lng]}
                    icon={makePinIcon(p.urgency)}>
              <Popup>
                <PopupContent p={p} />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}
