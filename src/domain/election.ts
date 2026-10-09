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
  semVoto: number;
  conquistaBasta: boolean;
  pct: number;
  lulaVence: boolean;
};

export function analisarLocal(l: LocalBruto): LocalAnalisado {
  const dif = l.flavio - l.lula;
  const lulaVence = dif < 0;
  const semVoto = l.abstencoes + l.brancos + l.nulos;
  const reserva = l.outros + semVoto;
  const virar = lulaVence ? 0 : Math.floor(dif / 2) + 1;
  const conquistar = lulaVence ? 0 : dif + 1;
  const pct = l.aptos > 0 ? dif / l.aptos : 0;
  return {
    ...l,
    dif,
    lulaVence,
    reserva,
    semVoto,
    virar,
    conquistar,
    conquistaBasta: conquistar <= reserva,
    pct,
  };
}

export function ordenarLocais(locais: LocalAnalisado[]) {
  return [...locais].sort((a, b) => b.semVoto - a.semVoto || b.dif - a.dif);
}

export function destacadosPorSemVoto(locais: LocalAnalisado[]) {
  const valores = locais.map((l) => l.semVoto).sort((a, b) => b - a);
  const limiar = valores[Math.ceil(valores.length / 4) - 1];
  return new Set(
    locais.filter((l) => l.semVoto > 0 && l.semVoto >= limiar).map((l) => l.id),
  );
}

export { TEXTOS } from '../lib/ui-pt';
