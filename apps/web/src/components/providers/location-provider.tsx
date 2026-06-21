'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ARGENTINA_PROVINCES, DEFAULT_LOCATION } from '@/lib/argentina-provinces';

export interface UserLocation {
  latitude: number;
  longitude: number;
  label: string;
  source: 'gps' | 'manual' | 'default';
}

interface LocationContextValue {
  location: UserLocation;
  radiusKm: number;
  setRadiusKm: (km: number) => void;
  isLocating: boolean;
  error: string | null;
  requestGps: () => void;
  setManualProvince: (provinceName: string) => void;
  hasGps: boolean;
}

const STORAGE_KEY = 'fixya-user-location';

const LocationContext = createContext<LocationContextValue | null>(null);

function loadStored(): UserLocation | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserLocation;
  } catch {
    return null;
  }
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<UserLocation>({
    latitude: DEFAULT_LOCATION.lat,
    longitude: DEFAULT_LOCATION.lng,
    label: DEFAULT_LOCATION.label,
    source: 'default',
  });
  const [radiusKm, setRadiusKm] = useState(50);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGps, setHasGps] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setLocation(stored);
      setHasGps(stored.source === 'gps');
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((loc: UserLocation) => {
    setLocation(loc);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  }, []);

  const requestGps = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      return;
    }
    setIsLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        persist({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: 'Tu ubicación actual',
          source: 'gps',
        });
        setHasGps(true);
        setIsLocating(false);
      },
      () => {
        setError('No pudimos obtener tu ubicación. Elegí una provincia manualmente.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 },
    );
  }, [persist]);

  const setManualProvince = useCallback(
    (provinceName: string) => {
      const prov = ARGENTINA_PROVINCES.find(
        (p) => p.name.toLowerCase() === provinceName.toLowerCase(),
      );
      if (!prov) return;
      persist({
        latitude: prov.lat,
        longitude: prov.lng,
        label: `${prov.name}, Argentina`,
        source: 'manual',
      });
      setHasGps(false);
      setError(null);
    },
    [persist],
  );

  useEffect(() => {
    if (hydrated && !loadStored()) {
      requestGps();
    }
  }, [hydrated, requestGps]);

  const value = useMemo(
    () => ({
      location,
      radiusKm,
      setRadiusKm,
      isLocating,
      error,
      requestGps,
      setManualProvince,
      hasGps,
    }),
    [location, radiusKm, isLocating, error, requestGps, setManualProvince, hasGps],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation debe usarse dentro de LocationProvider');
  return ctx;
}
