'use client';
/**
 * LiveMap — Braj Zone real-time worker presence map
 * Uses CartoDB dark tiles + UP district GeoJSON (public/up-districts.geojson)
 * Highlights BRAJ zone districts by live health %; shows worker GPS dots
 *
 * Must be imported with dynamic() + ssr:false in the consumer page:
 *   const LiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false });
 */

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const BRAJ = new Set(['Mainpuri', 'Etawah', 'Firozabad', 'Agra']);

function healthColor(health) {
  if (health >= 80) return '#22c55e';
  if (health >= 50) return '#3b82f6';
  if (health > 0)   return '#f59e0b';
  return '#374151';
}

export default function LiveMap({ workers = [], districtsInZone = [] }) {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch('/up-districts.geojson')
      .then(r => r.json())
      .then(setGeoData)
      .catch(() => {});
  }, []);

  // Build a lookup: district name → stats
  const healthMap = Object.fromEntries(districtsInZone.map(d => [d.name, d]));

  // Style each UP district polygon
  function styleFeature(feature) {
    const name   = feature.properties.DISTRICT;
    const isBraj = BRAJ.has(name);
    const dist   = healthMap[name];
    const color  = isBraj ? healthColor(dist?.health ?? 0) : '#374151';
    return {
      fillColor:   color,
      fillOpacity: isBraj ? 0.40 : 0.07,
      color:       isBraj ? color : '#374151',
      weight:      isBraj ? 2 : 0.4,
      opacity:     isBraj ? 1 : 0.35,
    };
  }

  // Bind tooltip to BRAJ districts
  function onEachFeature(feature, layer) {
    const name = feature.properties.DISTRICT;
    if (!BRAJ.has(name)) return;
    const dist = healthMap[name];
    layer.bindTooltip(
      `<div style="background:#111;color:#ddd;padding:6px 12px;border-radius:8px;
                   border:1px solid #333;font-family:monospace;font-size:11px;line-height:1.6;">
         <strong style="color:#fff">${name}</strong><br/>
         Online: <span style="color:#22c55e">${dist?.onlineCount ?? 0}</span><br/>
         Health: <span style="color:#f59e0b">${dist?.health ?? 0}%</span><br/>
         Status: <span style="color:#9ca3af">${dist?.status ?? '—'}</span>
       </div>`,
      { permanent: false, sticky: true, className: 'leaflet-tooltip-dark' }
    );
  }

  // Force GeoJSON layer remount when district health changes
  const geoKey = districtsInZone.map(d => `${d.name}:${d.health}`).join('|');

  const geoWorkers = workers.filter(w => w.lat != null && w.lng != null);

  return (
    <MapContainer
      center={[27.05, 78.55]}
      zoom={8}
      style={{ height: '100%', width: '100%', background: '#090909' }}
      scrollWheelZoom={false}
      zoomControl
    >
      {/* CartoDB Dark Matter tiles — fits black/dark EMS theme */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/" target="_blank">CARTO</a>'
        maxZoom={19}
        subdomains="abcd"
      />

      {/* UP district boundaries */}
      {geoData && (
        <GeoJSON
          key={geoKey}
          data={geoData}
          style={styleFeature}
          onEachFeature={onEachFeature}
        />
      )}

      {/* Live worker presence dots */}
      {geoWorkers.map((worker, i) => (
        <CircleMarker
          key={`w-${i}`}
          center={[worker.lat, worker.lng]}
          radius={5}
          pathOptions={{
            fillColor:   '#22c55e',
            color:       '#16a34a',
            weight:      1.5,
            fillOpacity: 0.9,
          }}
        >
          <Popup>
            <div style={{
              color: '#fff', background: '#111', padding: '8px 12px',
              borderRadius: '8px', border: '1px solid #333',
              fontFamily: 'monospace', fontSize: '11px', lineHeight: 1.6,
            }}>
              <strong>{worker.name || 'Worker'}</strong><br />
              <span style={{ color: '#9ca3af' }}>{worker.role}</span> ·{' '}
              <span style={{ color: '#dc2626' }}>{worker.district}</span>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
