import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button, Card, CardContent, Input } from '@momoi-labs/kiso-react';
import { LocateFixed } from 'lucide-react';
import { LogoCartaz } from '../mapa/LogoCartaz';
import { localizarCep, pedirLocalizacao } from '../../lib/geocode';
import { getExemploDoIndex } from '../../data/load-locais';
import {
  mapaSearchFromLocalizacao,
  type MapaSearch,
} from '../../lib/mapa-search';
import { UI } from '../../lib/ui-pt';
import '../mapa/mapa.css';

export function WelcomePage() {
  const navigate = useNavigate();
  const [cep, setCep] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const irMapa = (search: MapaSearch) => {
    void navigate({ to: '/mapa', search });
  };

  const usarLocalizacao = async () => {
    setErro(null);
    setCarregando(true);
    try {
      const latlng = await pedirLocalizacao();
      irMapa(mapaSearchFromLocalizacao(latlng, UI.voceAqui));
    } catch (e) {
      setErro(e instanceof Error ? e.message : UI.erroObterLocalizacao);
    } finally {
      setCarregando(false);
    }
  };

  const buscar = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) {
      setErro(UI.cepNumeros);
      return;
    }
    setErro(null);
    setCarregando(true);
    try {
      const { latlng, rotulo } = await localizarCep(digits);
      irMapa(mapaSearchFromLocalizacao(latlng, rotulo));
    } catch (err) {
      setErro(err instanceof Error ? err.message : UI.falhaCep);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="welcome-paper">
      <div style={{ width: '100%', maxWidth: '32.5rem' }}>
        <LogoCartaz />
        <p
          style={{
            fontSize: '0.6875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--color-muted-foreground)',
            marginTop: '1.25rem',
          }}
        >
          {UI.eleicoes2026}
        </p>
        <h1 className="welcome-grito">Quantos votos faltam no seu bairro?</h1>
        <span className="welcome-faixa">Converse com seus vizinhos</span>
        <p style={{ margin: '1.125rem 0 1.375rem', fontSize: '1rem' }}>
          {UI.blocoVotacao}
        </p>
        <Card>
          <CardContent style={{ display: 'grid', gap: '0.625rem' }}>
            <Button
              type="button"
              variant="primary"
              onClick={() => void usarLocalizacao()}
              disabled={carregando}
            >
              <LocateFixed size={18} aria-hidden />
              {UI.usarLocalizacao}
            </Button>
            <p
              style={{
                textAlign: 'center',
                fontSize: '0.6875rem',
                textTransform: 'uppercase',
                color: 'var(--color-muted-foreground)',
                margin: 0,
              }}
            >
              ou
            </p>
            <form className="mapa-topo busca" onSubmit={(e) => void buscar(e)}>
              <Input
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="Digite um CEP"
                aria-label="CEP"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
              />
              <Button type="submit" disabled={carregando}>Buscar</Button>
            </form>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-muted-foreground)' }}>
              Exemplo:{' '}
              <button
                type="button"
                style={{
                  border: 0,
                  background: 'none',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  color: 'inherit',
                  padding: 0,
                }}
                onClick={() => setCep('69900-370')}
              >
                69900-370
              </button>{' '}
              (Bosque, Rio Branco)
            </p>
            {erro ? (
              <p role="alert" style={{ margin: 0, color: 'var(--color-accent-600)' }}>
                {erro}
              </p>
            ) : null}
          </CardContent>
        </Card>
        <p
          style={{
            marginTop: '0.875rem',
            fontSize: '0.75rem',
            color: 'var(--color-muted-foreground)',
          }}
        >
          {UI.dadosTse}
        </p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
          <button
            type="button"
            style={{
              border: 0,
              background: 'none',
              textDecoration: 'underline',
              cursor: 'pointer',
              padding: 0,
            }}
            onClick={() => {
              void getExemploDoIndex().then((ex) => {
                if (ex) {
                  irMapa({
                    exemplo: true,
                    lat: ex.lat,
                    lng: ex.lng,
                    rotulo: ex.rotulo,
                  });
                } else {
                  irMapa({ exemplo: true });
                }
              });
            }}
          >
            Ver exemplo com local onde Lula vence
          </button>
        </p>
      </div>
    </div>
  );
}
