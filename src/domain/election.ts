export type LocalBruto = {
  id: string;
  uf: string;
  municipio: string;
  nome: string;
  endereco: string;
  bairro: string;
  cep: string;
  lat: number;
  lng: number;
  lula: number;
  flavio: number;
  outros: number;
  brancos: number;
  nulos: number;
  abstencoes: number;
  aptos: number;
  ficticio?: boolean;
};

export type LocalAnalisado = LocalBruto & {
  dif: number;
  virar: number;
  conquistar: number;
  reserva: number;
  conquistaBasta: boolean;
  pct: number;
  lulaVence: boolean;
};

export function analisarLocal(l: LocalBruto): LocalAnalisado {
  const dif = l.flavio - l.lula;
  const lulaVence = dif < 0;
  const reserva = l.outros + l.brancos + l.nulos + l.abstencoes;
  const virar = lulaVence ? 0 : Math.floor(dif / 2) + 1;
  const conquistar = lulaVence ? 0 : dif + 1;
  const pct = l.aptos > 0 ? dif / l.aptos : 0;
  return {
    ...l,
    dif,
    lulaVence,
    reserva,
    virar,
    conquistar,
    conquistaBasta: conquistar <= reserva,
    pct,
  };
}

export function ordenarLocais(locais: LocalAnalisado[]) {
  const flavio = locais
    .filter((l) => !l.lulaVence)
    .sort((a, b) => a.virar - b.virar);
  const lula = locais
    .filter((l) => l.lulaVence)
    .sort((a, b) => -a.dif - -b.dif);
  return { flavio, lula };
}

export { TEXTOS } from '../lib/ui-pt';
