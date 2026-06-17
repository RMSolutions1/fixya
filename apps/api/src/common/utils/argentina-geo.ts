/** Coordenadas aproximadas por provincia (centroide) para el mapa de profesionales */
const PROVINCE_COORDS: Record<string, { lat: number; lng: number }> = {
  'buenos aires': { lat: -34.6037, lng: -58.3816 },
  caba: { lat: -34.6037, lng: -58.3816 },
  'ciudad autónoma de buenos aires': { lat: -34.6037, lng: -58.3816 },
  catamarca: { lat: -28.4696, lng: -65.7795 },
  chaco: { lat: -27.451, lng: -58.9867 },
  chubut: { lat: -43.3002, lng: -65.1023 },
  córdoba: { lat: -31.4201, lng: -64.1888 },
  cordoba: { lat: -31.4201, lng: -64.1888 },
  corrientes: { lat: -27.4692, lng: -58.8306 },
  'entre ríos': { lat: -31.7333, lng: -60.5297 },
  'entre rios': { lat: -31.7333, lng: -60.5297 },
  formosa: { lat: -26.1775, lng: -58.1781 },
  jujuy: { lat: -24.1858, lng: -65.2995 },
  'la pampa': { lat: -36.6167, lng: -64.2833 },
  'la rioja': { lat: -29.4131, lng: -66.8558 },
  mendoza: { lat: -32.8895, lng: -68.8458 },
  misiones: { lat: -27.3621, lng: -55.9009 },
  neuquén: { lat: -38.9516, lng: -68.0591 },
  neuquen: { lat: -38.9516, lng: -68.0591 },
  'río negro': { lat: -40.8135, lng: -62.9967 },
  'rio negro': { lat: -40.8135, lng: -62.9967 },
  salta: { lat: -24.7821, lng: -65.4232 },
  'san juan': { lat: -31.5375, lng: -68.5364 },
  'san luis': { lat: -33.3017, lng: -66.3378 },
  'santa cruz': { lat: -51.623, lng: -69.2168 },
  'santa fe': { lat: -31.6333, lng: -60.7 },
  'santiago del estero': { lat: -27.7951, lng: -64.2615 },
  'tierra del fuego': { lat: -54.8019, lng: -68.303 },
  tucumán: { lat: -26.8083, lng: -65.2176 },
  tucuman: { lat: -26.8083, lng: -65.2176 },
};

export function coordsForProvince(province?: string | null): { lat: number; lng: number } {
  if (!province) return { lat: -34.6037, lng: -58.3816 };
  const key = province.trim().toLowerCase();
  return PROVINCE_COORDS[key] ?? { lat: -34.6037, lng: -58.3816 };
}
