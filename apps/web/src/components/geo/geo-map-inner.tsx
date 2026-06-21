'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import type { GeoMapProps } from './geo-map';
import { getCategoryMarkerColor } from '@/lib/category-colors';

function createTradeIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

const UserIcon = L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#75AADB;border:3px solid #fff;box-shadow:0 0 0 4px rgba(117,170,219,.35)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

type MarkerClusterGroup = ReturnType<typeof L.markerClusterGroup>;

export function GeoMapInner({
  center,
  markers,
  radiusKm = 50,
  className = '',
  zoom = 12,
  clusterMarkers = false,
  onMarkerClick,
}: GeoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const clusterGroupRef = useRef<MarkerClusterGroup | null>(null);
  const plainMarkersRef = useRef<L.Marker[]>([]);
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

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
      userMarkerRef.current = null;
      radiusCircleRef.current = null;
      clusterGroupRef.current = null;
      plainMarkersRef.current = [];
    };
  }, [center.lat, center.lng, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([center.lat, center.lng]);
    } else {
      userMarkerRef.current = L.marker([center.lat, center.lng], { icon: UserIcon })
        .addTo(map)
        .bindPopup('<strong>Vos</strong><br/>Centro de búsqueda');
    }

    if (radiusCircleRef.current) {
      radiusCircleRef.current.setLatLng([center.lat, center.lng]);
      radiusCircleRef.current.setRadius(radiusKm * 1000);
    } else {
      radiusCircleRef.current = L.circle([center.lat, center.lng], {
        radius: radiusKm * 1000,
        color: '#2E2A6E',
        fillColor: '#75AADB',
        fillOpacity: 0.08,
        weight: 2,
        dashArray: '6 4',
      }).addTo(map);
    }
  }, [center.lat, center.lng, radiusKm]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (clusterGroupRef.current) {
      clusterGroupRef.current.clearLayers();
      map.removeLayer(clusterGroupRef.current);
      clusterGroupRef.current = null;
    }
    plainMarkersRef.current.forEach((m) => map.removeLayer(m));
    plainMarkersRef.current = [];

    const useClusters = clusterMarkers && markers.length > 40;
    const clusterGroup = useClusters
      ? L.markerClusterGroup({
          maxClusterRadius: 50,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          disableClusteringAtZoom: 16,
        })
      : null;

    markers.forEach((m) => {
      const color = getCategoryMarkerColor(m.categorySlug, m.specialty);
      const marker = L.marker([m.latitude, m.longitude], { icon: createTradeIcon(color) });
      const trade = m.specialty ? `<br/><small>${m.specialty}</small>` : '';
      const dist =
        m.distanceKm != null ? `<br/><small>${m.distanceKm} km</small>` : '';
      marker.bindPopup(`<strong>${m.label}</strong>${trade}${dist}`);
      marker.on('click', () => onMarkerClickRef.current?.(m.id));

      if (clusterGroup) {
        clusterGroup.addLayer(marker);
      } else {
        marker.addTo(map);
        plainMarkersRef.current.push(marker);
      }
    });

    if (clusterGroup) {
      clusterGroup.addTo(map);
      clusterGroupRef.current = clusterGroup;
    }

    if (markers.length > 0) {
      const bounds = L.latLngBounds([
        [center.lat, center.lng],
        ...markers.map((m) => [m.latitude, m.longitude] as [number, number]),
      ]);
      map.fitBounds(bounds.pad(0.15));
    } else {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [center.lat, center.lng, markers, zoom, clusterMarkers]);

  return (
    <div
      ref={containerRef}
      className={`z-0 h-full min-h-[280px] overflow-hidden rounded-2xl border shadow-inner ${className}`}
    />
  );
}
