/** Utilidades geográficas compartidas (Haversine + bounding box) */

export function geoBoundingBox(lat: number, lng: number, radiusKm: number) {
  const latDelta = radiusKm / 111;
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  return {
    latitude: { gte: lat - latDelta, lte: lat + latDelta },
    longitude: { gte: lng - lngDelta, lte: lng + lngDelta },
  };
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const dφ = φ2 - φ1;
  const dλ = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

/** Filtro Prisma: servicios con coords dentro del bounding box */
export function geoServiceWhere(lat: number, lng: number, radiusKm: number) {
  const bbox = geoBoundingBox(lat, lng, radiusKm);
  return {
    latitude: { not: null, gte: bbox.latitude.gte, lte: bbox.latitude.lte },
    longitude: { not: null, gte: bbox.longitude.gte, lte: bbox.longitude.lte },
  };
}
