'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { GeoMapProps } from './geo-map';

const FixYaIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;border-radius:50%;background:#2E2A6E;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const UserIcon = L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#75AADB;border:3px solid #fff;box-shadow:0 0 0 4px rgba(117,170,219,.35)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function GeoMapInner({
  center,
  markers,
  radiusKm = 50,
  className = '',
  zoom = 12,
  onMarkerClick,
}: GeoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center.lat, center.lng, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    L.marker([center.lat, center.lng], { icon: UserIcon })
      .addTo(map)
      .bindPopup('<strong>Vos</strong><br/>Centro de búsqueda');

    L.circle([center.lat, center.lng], {
      radius: radiusKm * 1000,
      color: '#2E2A6E',
      fillColor: '#75AADB',
      fillOpacity: 0.08,
      weight: 2,
      dashArray: '6 4',
    }).addTo(map);

    markers.forEach((m) => {
      const marker = L.marker([m.latitude, m.longitude], { icon: FixYaIcon }).addTo(map);
      const dist =
        m.distanceKm != null ? `<br/><small>${m.distanceKm} km</small>` : '';
      marker.bindPopup(`<strong>${m.label}</strong>${dist}`);
      if (onMarkerClick) {
        marker.on('click', () => onMarkerClick(m.id));
      }
    });

    if (markers.length > 0) {
      const bounds = L.latLngBounds([
        [center.lat, center.lng],
        ...markers.map((m) => [m.latitude, m.longitude] as [number, number]),
      ]);
      map.fitBounds(bounds.pad(0.15));
    } else {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [center, markers, radiusKm, zoom, onMarkerClick]);

  return (
    <div
      ref={containerRef}
      className={`z-0 h-full min-h-[280px] overflow-hidden rounded-2xl border shadow-inner ${className}`}
    />
  );
}
