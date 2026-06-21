/** Provincias argentinas con centroides para selector manual de ubicación */
export const ARGENTINA_PROVINCES = [
  { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816 },
  { name: 'CABA', lat: -34.6037, lng: -58.3816 },
  { name: 'Catamarca', lat: -28.4696, lng: -65.7795 },
  { name: 'Chaco', lat: -27.451, lng: -58.9867 },
  { name: 'Chubut', lat: -43.3002, lng: -65.1023 },
  { name: 'Córdoba', lat: -31.4201, lng: -64.1888 },
  { name: 'Corrientes', lat: -27.4692, lng: -58.8306 },
  { name: 'Entre Ríos', lat: -31.7333, lng: -60.5297 },
  { name: 'Formosa', lat: -26.1775, lng: -58.1781 },
  { name: 'Jujuy', lat: -24.1858, lng: -65.2995 },
  { name: 'La Pampa', lat: -36.6167, lng: -64.2833 },
  { name: 'La Rioja', lat: -29.4131, lng: -66.8558 },
  { name: 'Mendoza', lat: -32.8895, lng: -68.8458 },
  { name: 'Misiones', lat: -27.3621, lng: -55.9009 },
  { name: 'Neuquén', lat: -38.9516, lng: -68.0591 },
  { name: 'Río Negro', lat: -40.8135, lng: -62.9967 },
  { name: 'Salta', lat: -24.7821, lng: -65.4232 },
  { name: 'San Juan', lat: -31.5375, lng: -68.5364 },
  { name: 'San Luis', lat: -33.3017, lng: -66.3378 },
  { name: 'Santa Cruz', lat: -51.623, lng: -69.2168 },
  { name: 'Santa Fe', lat: -31.6333, lng: -60.7 },
  { name: 'Santiago del Estero', lat: -27.7951, lng: -64.2615 },
  { name: 'Tierra del Fuego', lat: -54.8019, lng: -68.303 },
  { name: 'Tucumán', lat: -26.8083, lng: -65.2176 },
] as const;

export const DEFAULT_LOCATION = { lat: -24.7821, lng: -65.4232, label: 'Salta, Argentina' };

export function findProvince(name: string) {
  const n = name.trim().toLowerCase();
  return ARGENTINA_PROVINCES.find((p) => p.name.toLowerCase() === n);
}
