'use client';
/**
 * BoothMap — Jan Sampark personal GPS map
 * Shows the worker's live location (GPS) and a pin marking their booth area.
 *
 * Must be imported with dynamic() + ssr:false in the consumer page:
 *   const BoothMap = dynamic(() => import('@/components/BoothMap'), { ssr: false });
 */

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fallback district centres for BRAJ zone (lat, lng)
const DISTRICT_CENTRES = {
  Mainpuri:  [27.2355, 79.0212],
  Etawah:    [26.7851, 79.0189],
  Firozabad: [27.1536, 78.3952],
  Agra:      [27.1767, 78.0081],
};
const DEFAULT_CENTER = [27.05, 78.55]; // BRAJ zone centre

// Custom DivIcon — no image files needed (avoids Next.js broken icon issue)
const myIcon = L.divIcon({
  html: `<div style="
    width:16px;height:16px;border-radius:50%;
    background:#DA251D;border:3px solid #fff;
    box-shadow:0 0 10px rgba(218,37,29,0.8),0 0 20px rgba(218,37,29,0.4);
  "></div>`,
  className: '',
  iconSize:   [16, 16],
  iconAnchor: [8, 8],
  popupAnchor:[0, -10],
});

/** Moves the map view to (lat, lng) whenever they change */
function FlyTo({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) map.flyTo([lat, lng], 15, { duration: 1.2 });
  }, [lat, lng, map]);
  return null;
}

export default function BoothMap({ district = '', name = '' }) {
  const [pos, setPos] = useState(null);
  const [gpsError, setGpsError] = useState(false);

  // Get device GPS location once on mount
  useEffect(() => {
    if (!navigator.geolocation) { setGpsError(true); return; }
    const id = navigator.geolocation.watchPosition(
      ({ coords }) => setPos({ lat: coords.latitude, lng: coords.longitude }),
      () => setGpsError(true),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // Default centre: use district centre if available, else BRAJ centre
  const centre = pos
    ? [pos.lat, pos.lng]
    : DISTRICT_CENTRES[district] ?? DEFAULT_CENTER;

  return (
    <MapContainer
      center={centre}
      zoom={pos ? 15 : 10}
      style={{ height: '100%', width: '100%', background: '#010804' }}
      scrollWheelZoom={false}
      zoomControl
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/" target="_blank">CARTO</a>'
        maxZoom={19}
        subdomains="abcd"
      />

      {pos && (
        <>
          <FlyTo lat={pos.lat} lng={pos.lng} />
          <Marker position={[pos.lat, pos.lng]} icon={myIcon}>
            <Popup>
              <div style={{
                color: '#fff', background: '#111', padding: '8px 12px',
                borderRadius: '8px', border: '1px solid #333',
                fontFamily: 'monospace', fontSize: '11px', lineHeight: 1.6,
              }}>
                <strong style={{ color: '#DA251D' }}>YOU</strong><br />
                {name || 'Jan Sampark Sathi'}<br />
                <span style={{ color: '#9ca3af' }}>{district || 'BRAJ Zone'}</span><br />
                <span style={{ color: '#6b7280', fontSize: '9px' }}>
                  {pos.lat.toFixed(5)}, {pos.lng.toFixed(5)}
                </span>
              </div>
            </Popup>
          </Marker>
        </>
      )}

      {/* Fallback: show district centre pin when GPS not available */}
      {!pos && !gpsError && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          zIndex: 9999, color: '#DA251D', fontFamily: 'monospace', fontSize: '11px',
          background: 'rgba(1,8,4,0.8)', padding: '6px 12px', borderRadius: '8px',
          border: '1px solid rgba(218,37,29,0.3)',
        }}>
          Acquiring GPS…
        </div>
      )}

      {gpsError && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          zIndex: 9999, color: '#6b7280', fontFamily: 'monospace', fontSize: '11px',
          background: 'rgba(1,8,4,0.8)', padding: '6px 12px', borderRadius: '8px',
          border: '1px solid #374151',
        }}>
          GPS Unavailable — showing {district || 'Braj'} area
        </div>
      )}
    </MapContainer>
  );
}
