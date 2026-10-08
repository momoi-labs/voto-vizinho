import type { LatLngTuple } from 'leaflet';

export type MapaSearch = {
  exemplo: boolean;
  lat?: number;
  lng?: number;
  rotulo?: string;
};

function parseCoord(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function parseMapaSearch(search: Record<string, unknown>): MapaSearch {
  return {
    exemplo: search.exemplo === '1' || search.exemplo === true,
    lat: parseCoord(search.lat),
    lng: parseCoord(search.lng),
    rotulo:
      typeof search.rotulo === 'string' && search.rotulo.length > 0
        ? search.rotulo
        : undefined,
  };
}

export function mapaSearchFromLocalizacao(
  latlng: LatLngTuple,
  rotulo: string,
  exemplo = false,
): MapaSearch {
  return {
    exemplo,
    lat: latlng[0],
    lng: latlng[1],
    rotulo,
  };
}
