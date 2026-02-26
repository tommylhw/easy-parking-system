import { Coordinates } from '@/src/types/domain';

const EARTH_RADIUS_KM = 6371;

function degToRad(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceKm(a: Coordinates, b: Coordinates): number {
  const dLat = degToRad(b.latitude - a.latitude);
  const dLon = degToRad(b.longitude - a.longitude);

  const lat1 = degToRad(a.latitude);
  const lat2 = degToRad(b.latitude);

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return EARTH_RADIUS_KM * c;
}

export function withDistance<T extends { coordinates: Coordinates }>(items: T[], origin?: Coordinates): T[] {
  if (!origin) {
    return items;
  }

  return items
    .map((item) => ({
      ...item,
      distanceKm: distanceKm(origin, item.coordinates),
    }))
    .sort((a, b) => (a.distanceKm ?? Number.POSITIVE_INFINITY) - (b.distanceKm ?? Number.POSITIVE_INFINITY));
}
