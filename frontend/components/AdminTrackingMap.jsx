'use client';
/**
 * AdminTrackingMap — Super Admin full workforce tracking map
 *
 * Shows all online workers as role-coloured dots over CartoDB Dark Tiles.
 * Selected worker flies the map to their location and shows popup details.
 *
 * Import with: dynamic(() => import('@/components/AdminTrackingMap'), { ssr: false })
 */

import { useEffect, useState, useRef } from 'react';
import {
  MapContainer, TileLayer, CircleMarker, Popup, useMap, GeoJSON,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Role colour palette
export const ROLE_COLOR = {
  STATE:        '#a855f7',   // purple
  ZONE:         '#f59e0b',   // amber
  DISTRICT:     '#3b82f6',   // blue
  BOOTH_PRES:   '#22c55e',   // green
  BOOTH_MGR:    '#06b6d4',   // cyan
  JSS:          '#DA251D',   // red  (Jan Sampark Sathi)
  DEFAULT:      '#9ca3af',   // grey
};

function roleColor(role = '') {
  const r = role.toUpperCase();
  if (r.includes('STATE'))   return ROLE_COLOR.STATE;
  if (r.includes('ZONE'))    return ROLE_COLOR.ZONE;
  if (r.includes('DISTRICT') || r.includes('DIST')) return ROLE_COLOR.DISTRICT;
  if (r.includes('PRESIDENT') || r.includes('PRES')) return ROLE_COLOR.BOOTH_PRES;
  if (r.includes('MANAGER')  || r.includes('MGR'))  return ROLE_COLOR.BOOTH_MGR;
  if (r.includes('JSS') || r.includes('SAMPARK') || r.includes('SATHI')) return ROLE_COLOR.JSS;
  return ROLE_COLOR.DEFAULT;
}

/** Fly-to helper: moves map when selectedId changes */
function FlyToWorker({ worker }) {
  const map = useMap();
  useEffect(() => {
    if (worker?.lat != null && worker?.lng != null) {
      map.flyTo([worker.lat, worker.lng], 15, { duration: 1.0 });
    }
  }, [worker, map]);
  return null;
}

export default function AdminTrackingMap({ workers = [], geoData = null, selectedId = null }) {
  const geoWorkers = workers.filter(w => w.lat != null && w.lng != null);
  const selected   = geoWorkers.find(w => w.workerId === selectedId) ?? null;

  // Minimal UP district boundary style (thin outline only)
  const distStyle = () => ({
    fillColor:   'transparent',
    fillOpacity: 0,
    color:       '#1f2937',
    weight:      0.8,
    opacity:     0.6,
  });

  /* Key changes force GeoJSON re-render when data updates */
  const geoKey = workers.length;

  return (
    <MapContainer
      center={[27.05, 80.5]}
      zoom={7}
      style={{ height: '100%', width: '100%', background: '#050505' }}
      scrollWheelZoom
      zoomControl
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        maxZoom={19}
        subdomains="abcd"
      />

      {/* UP district outlines */}
      {geoData && (
        <GeoJSON key={`geo-${geoKey}`} data={geoData} style={distStyle} />
      )}

      {/* Fly to selected worker */}
      {selected && <FlyToWorker worker={selected} />}

      {/* Worker dots */}
      {geoWorkers.map((w, i) => {
        const color    = roleColor(w.role);
        const isActive = w.workerId === selectedId;
        return (
          <CircleMarker
            key={`w-${i}`}
            center={[w.lat, w.lng]}
            radius={isActive ? 9 : 6}
            pathOptions={{
              fillColor:   color,
              color:       isActive ? '#fff' : color,
              weight:      isActive ? 2.5 : 1,
              fillOpacity: 0.95,
            }}
          >
            <Popup>
              <div style={{
                background: '#0d0d0d', color: '#e5e7eb',
                padding: '8px 14px', borderRadius: '10px',
                border: `1px solid ${color}44`,
                fontFamily: 'monospace', fontSize: '11px', lineHeight: 1.7,
                minWidth: '160px',
              }}>
                <div style={{ color, fontWeight: 900, fontSize: '13px', marginBottom: 4 }}>
                  {w.name || 'Unknown'}
                </div>
                <div><span style={{ color: '#6b7280' }}>Role:</span> {w.role || '—'}</div>
                <div><span style={{ color: '#6b7280' }}>District:</span> {w.district || '—'}</div>
                <div style={{ marginTop: 4, fontSize: '9px', color: '#4b5563' }}>
                  {w.lat.toFixed(4)}, {w.lng.toFixed(4)}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
