"use client";
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

// ── colour helpers ─────────────────────────────────────────────────
const healthColor = (pct) => {
  if (pct >= 80) return { fill: '#16a34a', stroke: '#22c55e' };
  if (pct >= 60) return { fill: '#2563eb', stroke: '#60a5fa' };
  if (pct >= 40) return { fill: '#d97706', stroke: '#fbbf24' };
  return { fill: '#dc2626', stroke: '#f87171' };
};

const ROLE_COLORS = {
  STATE: '#a855f7', ZONE: '#f59e0b', DISTRICT: '#3b82f6',
  BOOTH_PRES: '#22c55e', BOOTH_MGR: '#06b6d4', JSS: '#DA251D',
};

export default function WarRoomMap({ level, geoData, statsMap, workers, onDrillDown, selectedId }) {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);
  const layersRef = useRef([]);
  const workerLayerRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!mapRef.current) return;

    const L = require('leaflet');

    // Tear down any existing instance (covers React Strict Mode double-invoke)
    if (instanceRef.current) {
      try { instanceRef.current.remove(); } catch (_) {}
      instanceRef.current = null;
    }
    // Also clear any stale Leaflet registration on the container element
    if (mapRef.current._leaflet_id) {
      try { L.map(mapRef.current).remove(); } catch (_) {}
    }

    const map = L.map(mapRef.current, {
      center: level === 'india' ? [22, 82] : [26.8, 80.9],
      zoom: level === 'india' ? 5 : level === 'state' ? 7 : 9,
      zoomControl: true,
      attributionControl: false,
    });
    instanceRef.current = map;

    // Dark map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // ── Render GeoJSON polygons ────────────────────────────────────
    if (geoData) {
      const features = geoData.features || [];
      layersRef.current = features.map(feature => {
        const props = feature.properties || {};
        const name = props.ST_NM || props.DISTRICT || props.AC_NAME || props.name || 'Unknown';
        const stats = (statsMap && statsMap[name]) || {};
        const turnout = stats.turnout || Math.floor(30 + Math.random() * 55);
        const { fill, stroke } = healthColor(turnout);
        const isSelected = selectedId === name;

        const layer = L.geoJSON(feature, {
          style: {
            fillColor: fill,
            fillOpacity: isSelected ? 0.85 : 0.45,
            color: isSelected ? '#ffffff' : stroke,
            weight: isSelected ? 2.5 : 1,
          },
        }).addTo(map);

        layer.on('mouseover', function (e) {
          e.target.setStyle({ fillOpacity: 0.75, weight: 2 });
          L.popup({ closeButton: false, autoPan: false })
            .setLatLng(e.latlng)
            .setContent(`
              <div style="font:700 11px/1.5 Inter,sans-serif;color:#fff;background:#0d1f14;
                padding:8px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);min-width:160px">
                <div style="font-size:13px;margin-bottom:6px;color:#a3e635">${name}</div>
                <div>🗳 Turnout: <b style="color:${fill}">${turnout}%</b></div>
                <div>👷 Workers: <b>${stats.workers || 0}</b></div>
                <div>🏛 Booths: <b>${stats.booths || 0}</b></div>
                ${stats.alerts ? `<div style="color:#f87171">⚠ ${stats.alerts} alerts</div>` : ''}
              </div>`)
            .openOn(map);
        });
        layer.on('mouseout', function (e) {
          e.target.setStyle({ fillOpacity: isSelected ? 0.85 : 0.45, weight: isSelected ? 2.5 : 1 });
          map.closePopup();
        });
        layer.on('click', function () {
          if (onDrillDown) onDrillDown(name, feature);
        });

        return layer;
      });

      // Fit bounds
      try {
        const bounds = L.geoJSON(geoData).getBounds();
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] });
      } catch (_) {}
    }

    // ── Worker GPS dots ────────────────────────────────────────────
    if (workers && workers.length) {
      if (workerLayerRef.current) workerLayerRef.current.remove();
      const group = L.layerGroup();
      workers.forEach(w => {
        if (!w.lat || !w.lng) return;
        const color = ROLE_COLORS[w.role] || '#9ca3af';
        const dot = L.circleMarker([w.lat, w.lng], {
          radius: 6, fillColor: color, color: '#000', weight: 1,
          fillOpacity: 0.9, className: 'worker-dot',
        });
        dot.bindTooltip(`<b>${w.name || w.workerId}</b><br>${w.role || ''} · ${w.district || ''}`,
          { direction: 'top' });
        group.addLayer(dot);
      });
      group.addTo(map);
      workerLayerRef.current = group;
    }

    return () => {
      try {
        if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null; }
      } catch (_) {}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoData, level, selectedId]);

  return (
    <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }} />
  );
}
