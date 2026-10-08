import type { LatLngBounds } from 'leaflet';
import { analisarLocal, type LocalAnalisado, type LocalBruto } from '../domain/election';

type UfBounds = {
  south: number;
  north: number;
  west: number;
  east: number;
};

type LocaisIndex = {
  ufs: string[];
  bounds: Record<string, UfBounds>;
  exemplo?: {
    id: string;
    lat: number;
    lng: number;
    rotulo: string;
  };
};

let indexCache: LocaisIndex | null = null;
const porUf = new Map<string, LocalAnalisado[]>();

async function carregarIndex(): Promise<LocaisIndex> {
  if (indexCache) return indexCache;
  const res = await fetch('/data/locais/index.json');
  if (!res.ok) throw new Error('Falha ao carregar índice de dados.');
  indexCache = (await res.json()) as LocaisIndex;
  return indexCache;
}

function boundsIntersectam(a: UfBounds, b: LatLngBounds) {
  const mapSouth = b.getSouth();
  const mapNorth = b.getNorth();
  const mapWest = b.getWest();
  const mapEast = b.getEast();
  return !(
    a.north < mapSouth ||
    a.south > mapNorth ||
    a.east < mapWest ||
    a.west > mapEast
  );
}

function ufsNoViewport(bounds: LatLngBounds, index: LocaisIndex): string[] {
  return index.ufs.filter((uf) => {
    const box = index.bounds[uf];
    return box ? boundsIntersectam(box, bounds) : false;
  });
}

async function carregarUf(uf: string, exemploFicticio: boolean): Promise<LocalAnalisado[]> {
  const cached = porUf.get(uf);
  if (cached) return cached;

  const res = await fetch(`/data/locais/${uf}.json`);
  if (!res.ok) throw new Error(`Falha ao carregar dados de ${uf}.`);
  const brutos = (await res.json()) as LocalBruto[];
  const index = await carregarIndex();
  const exemploId = index.exemplo?.id;

  const analisados = brutos.map((l) => {
    const base =
      exemploFicticio && exemploId && l.id === exemploId
        ? { ...l, lula: Math.max(l.lula, l.flavio + 50), ficticio: true }
        : l;
    return analisarLocal(base);
  });
  porUf.set(uf, analisados);
  return analisados;
}

export async function getExemploDoIndex() {
  const index = await carregarIndex();
  return index.exemplo ?? null;
}

export async function garantirLocaisParaBounds(
  bounds: LatLngBounds,
  exemploFicticio = false,
): Promise<LocalAnalisado[]> {
  const index = await carregarIndex();
  const ufs = ufsNoViewport(bounds, index);
  if (!ufs.length) return [];

  await Promise.all(ufs.map((uf) => carregarUf(uf, exemploFicticio)));
  const todos = ufs.flatMap((uf) => porUf.get(uf) ?? []);
  return todos.filter((l) => bounds.contains([l.lat, l.lng]));
}

/** Carrega UFs prováveis a partir de um ponto (CEP / geolocalização). */
export async function garantirLocaisPertoDe(
  lat: number,
  lng: number,
  exemploFicticio = false,
): Promise<LocalAnalisado[]> {
  const pad = 0.35;
  const south = lat - pad;
  const north = lat + pad;
  const west = lng - pad;
  const east = lng + pad;
  const index = await carregarIndex();
  const ufs = index.ufs.filter((uf) => {
    const b = index.bounds[uf];
    if (!b) return false;
    return !(b.north < south || b.south > north || b.east < west || b.west > east);
  });
  await Promise.all(ufs.map((uf) => carregarUf(uf, exemploFicticio)));
  return ufs.flatMap((uf) => porUf.get(uf) ?? []);
}
