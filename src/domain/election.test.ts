import { describe, expect, it } from 'vitest';
import {
  analisarLocal,
  destacadosPorSemVoto,
  ordenarLocais,
  type LocalBruto,
} from './election';

function local(
  id: string,
  votos: Partial<
    Pick<
      LocalBruto,
      'lula' | 'flavio' | 'outros' | 'brancos' | 'nulos' | 'abstencoes'
    >
  >,
) {
  return analisarLocal({
    id,
    uf: 'AC',
    municipio: 'Rio Branco',
    nome: id,
    endereco: '',
    bairro: '',
    cep: '',
    lat: 0,
    lng: 0,
    lula: 0,
    flavio: 0,
    outros: 0,
    brancos: 0,
    nulos: 0,
    abstencoes: 0,
    aptos: 5000,
    ...votos,
  });
}

const ids = (locais: { id: string }[]) => locais.map((l) => l.id);

describe('ordenarLocais', () => {
  it('ordena onde Flávio vence por quem não escolheu candidato, desempatando pelo maior número a virar', () => {
    const c = local('C', { flavio: 1059, lula: 1000, abstencoes: 700 });
    const a = local('A', { flavio: 1099, lula: 1000, abstencoes: 900 });
    const b = local('B', {
      flavio: 1239,
      lula: 1000,
      abstencoes: 500,
      brancos: 150,
      nulos: 50,
    });

    expect(c.virar).toBe(30);
    expect(a.virar).toBe(50);
    expect(b.virar).toBe(120);
    expect(ids(ordenarLocais([c, a, b]))).toEqual(['A', 'B', 'C']);
  });

  it('ordena onde Lula vence por quem não escolheu candidato, desempatando pela menor vantagem', () => {
    const folgada = local('folgada', {
      lula: 1500,
      flavio: 1000,
      nulos: 600,
    });
    const apertada = local('apertada', {
      lula: 1010,
      flavio: 1000,
      brancos: 600,
    });
    const maior = local('maior', { lula: 1200, flavio: 1000, abstencoes: 800 });

    expect(ids(ordenarLocais([folgada, maior, apertada]))).toEqual([
      'maior',
      'apertada',
      'folgada',
    ]);
  });

  it('mistura numa lista só os locais onde Lula vence e onde Flávio vence', () => {
    const lulaMuitos = local('lulaMuitos', {
      lula: 1100,
      flavio: 1000,
      abstencoes: 900,
    });
    const flavioPoucos = local('flavioPoucos', {
      flavio: 1100,
      lula: 1000,
      abstencoes: 100,
    });
    const flavioMedio = local('flavioMedio', {
      flavio: 1010,
      lula: 1000,
      abstencoes: 500,
    });
    const lulaMedio = local('lulaMedio', {
      lula: 1010,
      flavio: 1000,
      abstencoes: 500,
    });

    expect(
      ids(ordenarLocais([flavioPoucos, lulaMedio, lulaMuitos, flavioMedio])),
    ).toEqual(['lulaMuitos', 'flavioMedio', 'lulaMedio', 'flavioPoucos']);
  });
});

describe('destacadosPorSemVoto', () => {
  it('destaca o quarto dos locais com mais gente que não escolheu candidato', () => {
    const locais = [100, 800, 300, 700, 200, 600, 400, 500].map((n) =>
      local(`L${n}`, { abstencoes: n }),
    );

    expect([...destacadosPorSemVoto(locais)].sort()).toEqual(['L700', 'L800']);
  });

  it('destaca todos os empatados no limiar', () => {
    const locais = [100, 500, 500, 200].map((n, i) =>
      local(`L${i}`, { abstencoes: n }),
    );

    expect([...destacadosPorSemVoto(locais)].sort()).toEqual(['L1', 'L2']);
  });

  it('não destaca nada sem locais ou quando ninguém deixou de escolher', () => {
    expect(destacadosPorSemVoto([]).size).toBe(0);
    expect(destacadosPorSemVoto([local('A', {}), local('B', {})]).size).toBe(0);
  });
});
