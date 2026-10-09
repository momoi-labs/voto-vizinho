import type { LatLngTuple } from 'leaflet';
import { UI } from './ui-pt';

export const RIO_BRANCO_CENTER: LatLngTuple = [-9.9747, -67.8076];

export type CepLocalizado = {
  latlng: LatLngTuple;
  rotulo: string;
};

type ViaCepResponse = {
  erro?: boolean;
  cep: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade: string;
  uf: string;
};

type BrasilApiCep = {
  location?: {
    coordinates?: { latitude?: string; longitude?: string };
  };
};

function rotuloViaCep(info: ViaCepResponse) {
  return [
    info.cep,
    info.logradouro,
    info.bairro,
    `${info.localidade}/${info.uf}`,
  ]
    .filter(Boolean)
    .join(` ${UI.sep} `);
}

async function buscarEnderecoViaCep(
  cepDigits: string,
): Promise<ViaCepResponse> {
  const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
  if (!res.ok) throw new Error(UI.cepConsultaFalha);
  const info = (await res.json()) as ViaCepResponse;
  if (info.erro) throw new Error(UI.cepNaoEncontrado);
  return info;
}

async function coordenadasPorCep(
  cepDigits: string,
): Promise<LatLngTuple | null> {
  const brasil = await fetch(
    `https://brasilapi.com.br/api/cep/v2/${cepDigits}`,
  );
  if (!brasil.ok) return null;
  const data = (await brasil.json()) as BrasilApiCep;
  const lat = Number(data.location?.coordinates?.latitude);
  const lng = Number(data.location?.coordinates?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}

async function coordenadasPorEndereco(
  info: ViaCepResponse,
): Promise<LatLngTuple> {
  const params = new URLSearchParams({
    format: 'json',
    limit: '1',
    city: info.localidade,
    state: info.uf,
    country: 'Brasil',
  });
  if (info.logradouro) params.set('street', info.logradouro);

  const nom = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9' } },
  );
  const rows = (await nom.json()) as { lat: string; lon: string }[];
  if (!rows.length) throw new Error(UI.enderecoNaoMapa);

  return [Number(rows[0].lat), Number(rows[0].lon)];
}

/** CEP via ViaCEP (e-DNE Correios). API oficial exige contrato. */
export async function localizarCep(cepDigits: string): Promise<CepLocalizado> {
  const info = await buscarEnderecoViaCep(cepDigits);
  const rotulo = rotuloViaCep(info);

  const porCep = await coordenadasPorCep(cepDigits);
  if (porCep) return { latlng: porCep, rotulo };

  const latlng = await coordenadasPorEndereco(info);
  return { latlng, rotulo };
}

function posicaoAtual(options: PositionOptions): Promise<LatLngTuple> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve([p.coords.latitude, p.coords.longitude]),
      reject,
      options,
    );
  });
}

export async function pedirLocalizacao(): Promise<LatLngTuple> {
  if (!navigator.geolocation) throw new Error(UI.geoIndisponivel);
  try {
    return await posicaoAtual({
      enableHighAccuracy: true,
      timeout: 10_000,
      maximumAge: 0,
    });
  } catch (err) {
    const e = err as GeolocationPositionError;
    if (e.code === e.PERMISSION_DENIED) {
      throw new Error(UI.geoNegada, { cause: err });
    }
    try {
      return await posicaoAtual({
        enableHighAccuracy: false,
        timeout: 15_000,
        maximumAge: 60_000,
      });
    } catch (retryErr) {
      throw new Error(UI.geoNaoPossivel, { cause: retryErr });
    }
  }
}
