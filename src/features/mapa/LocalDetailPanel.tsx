import { Badge, Card, CardContent } from '@momoi-labs/kiso-react';
import { TEXTOS, type LocalAnalisado } from '../../domain/election';
import { fmt, pctAptos } from '../../lib/format';
import { UI } from '../../lib/ui-pt';

type Props = {
  local: LocalAnalisado;
};

export function LocalDetailPanel({ local: l }: Props) {
  const linhas = [
    [UI.flavioBolsonaro, l.flavio, 'flavio'],
    ['Lula', l.lula, 'lula'],
    ['Outros candidatos', l.outros, 'outros'],
    [
      'Brancos e nulos',
      l.brancos + l.nulos,
      'bn',
      UI.brancosNulos(fmt(l.brancos), fmt(l.nulos)),
    ],
    [UI.abstencoes, l.abstencoes, 'abst'],
    [UI.semVotoExp, l.semVoto, 'sem-voto'],
  ] as const;

  return (
    <div style={{ padding: '0.25rem 0' }}>
      <p
        style={{
          fontSize: '0.6875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--color-muted-foreground)',
        }}
      >
        {l.ficticio ? <Badge variant="warning">{UI.dadoFicticio}</Badge> : null}{' '}
        {UI.localVotacao} {UI.sep} {fmt(l.aptos)} {UI.eleitoresAptos}
      </p>
      <h2 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.125rem' }}>
        {l.nome}
      </h2>
      <p
        style={{
          margin: '0 0 1rem',
          fontSize: '0.8125rem',
          color: 'var(--color-muted-foreground)',
        }}
      >
        {l.endereco} {UI.sep} {l.bairro} {UI.sep} {l.municipio}/{l.uf}
      </p>

      <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
        {linhas.map(([rot, n, , sub]) => (
          <div
            key={String(rot)}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              fontSize: '0.8125rem',
            }}
          >
            <span>{rot}</span>
            <span
              style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
            >
              {fmt(n)}
            </span>
            {sub ? (
              <span
                style={{
                  gridColumn: '1 / -1',
                  fontSize: '0.6875rem',
                  color: 'var(--color-muted-foreground)',
                }}
              >
                {sub}
              </span>
            ) : null}
          </div>
        ))}
      </div>

      {l.lulaVence ? (
        <Card>
          <CardContent>
            <p
              className="poster-font"
              style={{
                color: 'var(--color-accent-600)',
                fontSize: '1.625rem',
                margin: '0 0 0.5rem',
              }}
            >
              {UI.lulaVenceAqui(fmt(-l.dif))}
            </p>
            <p style={{ margin: 0, fontSize: '0.8125rem' }}>
              {TEXTOS.mantenha}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <p
              className="poster-font"
              style={{
                display: 'inline-block',
                background: 'var(--color-accent-600)',
                color: '#fff',
                padding: '0.375rem 0.625rem',
                margin: '0 0 0.75rem',
                fontSize: '1.25rem',
              }}
            >
              {UI.paraLulaVencer}
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: '0.5rem',
                alignItems: 'start',
              }}
            >
              <div>
                <p
                  className="poster-font"
                  style={{
                    margin: 0,
                    fontSize: '2.5rem',
                    color: 'var(--color-accent-600)',
                    lineHeight: 1,
                  }}
                >
                  {fmt(l.virar)}
                </p>
                <p
                  style={{ margin: 0, fontWeight: 600, fontSize: '0.8125rem' }}
                >
                  votos virados
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.6875rem',
                    color: 'var(--color-muted-foreground)',
                  }}
                >
                  {TEXTOS.virarExp}
                </p>
              </div>
              <span
                style={{
                  fontSize: '0.6875rem',
                  textTransform: 'uppercase',
                  color: 'var(--color-muted-foreground)',
                  paddingTop: '0.875rem',
                }}
              >
                ou
              </span>
              <div>
                {l.conquistaBasta ? (
                  <>
                    <p
                      className="poster-font"
                      style={{
                        margin: 0,
                        fontSize: '2.5rem',
                        color: 'var(--color-accent-600)',
                        lineHeight: 1,
                      }}
                    >
                      {fmt(l.conquistar)}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                      }}
                    >
                      votos conquistados
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.6875rem',
                        color: 'var(--color-muted-foreground)',
                      }}
                    >
                      {TEXTOS.conquistarExp}
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      className="mapa-sym"
                      style={{ margin: 0, fontSize: '2rem' }}
                    >
                      {UI.travessao}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                      }}
                    >
                      {UI.soConquistarNaoBasta}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.6875rem',
                        color: 'var(--color-muted-foreground)',
                      }}
                    >
                      {UI.reservaConquistar(fmt(l.reserva), fmt(l.conquistar))}
                    </p>
                  </>
                )}
              </div>
            </div>
            {!l.conquistaBasta ? (
              <p
                style={{
                  margin: '0.75rem 0 0',
                  padding: '0.625rem 0.75rem',
                  background: 'var(--color-accent-50)',
                  borderLeft: '3px solid var(--color-accent-600)',
                  fontSize: '0.8125rem',
                }}
              >
                {TEXTOS.animo}
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}

      <p
        style={{
          marginTop: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.6875rem',
          color: 'var(--color-muted-foreground)',
        }}
      >
        <span>{UI.diferencaAptos(pctAptos(l.pct))}</span>
        <span>{UI.tseTurno}</span>
      </p>
    </div>
  );
}
