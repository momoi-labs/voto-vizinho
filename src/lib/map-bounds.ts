import type { LatLngBounds } from 'leaflet';

export function boundsIguais(a: LatLngBounds, b: LatLngBounds): boolean {
  const eq = (x: number, y: number) => Math.abs(x - y) < 1e-7;
  return (
    eq(a.getSouth(), b.getSouth()) &&
    eq(a.getNorth(), b.getNorth()) &&
    eq(a.getWest(), b.getWest()) &&
    eq(a.getEast(), b.getEast())
  );
}
