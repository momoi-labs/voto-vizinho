import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LatLngBounds, LatLngTuple } from 'leaflet';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  Input,
} from '@momoi-labs/kiso-react';
import { LocateFixed } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { ordenarLocais, type LocalAnalisado } from '../../domain/election';
import {
  garantirLocaisParaBounds,
  getExemploDoIndex,
} from '../../data/load-locais';
import { fmt, pctAptos } from '../../lib/format';
import { boundsIguais } from '../../lib/map-bounds';
import {
  localizarCep,
  pedirLocalizacao,
  RIO_BRANCO_CENTER,
} from '../../lib/geocode';
import type { MapaSearch } from '../../lib/mapa-search';
import { UI } from '../../lib/ui-pt';
import { LogoCartaz } from './LogoCartaz';
import { MapaView } from './MapaView';
import { LocalDetailPanel } from './LocalDetailPanel';
import './mapa.css';

type Aba = 'mapa' | 'lista';

type Props = MapaSearch;

const BRASIL_CENTER: LatLngTuple = [-14.235, -51.925];
const AREA_MAX_GRAUS = 1;

function useDesktop() {
  const [desktop, setDesktop] = useState(
    () => window.matchMedia('(min-width: 900px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const fn = () => setDesktop(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return desktop;
}

export function MapaPage({ exemplo, lat, lng, rotulo }: Props) {
  const desktop = useDesktop();
  const [locais, setLocais] = useState<LocalAnalisado[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [aba, setAba] = useState<Aba>('mapa');
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);

  const onBoundsChange = useCallback((b: LatLngBounds) => {
    setBounds((prev) => (prev && boundsIguais(prev, b) ? prev : b));
  }, []);
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [geo, setGeo] = useState<LatLngTuple | null>(null);
  const [focoManual, setFocoManual] = useState<{
    latlng: LatLngTuple;
    rotulo?: string;
  } | null>(null);
  const [cep, setCep] = useState('');

  const coordenadasUrl = useMemo((): LatLngTuple | null => {
    if (lat == null || lng == null) return null;
    return [lat, lng];
  }, [lat, lng]);

  const focoAtivo = useMemo(() => {
    if (focoManual) return focoManual;
    if (coordenadasUrl) {
      return { latlng: coordenadasUrl, rotulo: rotulo ?? UI.suaBusca };
    }
    if (geo) return { latlng: geo, rotulo: UI.voceAqui };
    return null;
  }, [focoManual, coordenadasUrl, rotulo, geo]);

  const center =
    focoAtivo?.latlng ?? (exemplo ? RIO_BRANCO_CENTER : BRASIL_CENTER);
  const zoom = focoAtivo ? 15 : exemplo ? 14 : 4;
  const ponto = focoAtivo?.latlng ?? null;
  const pontoRotulo = focoAtivo?.rotulo;

  const aviso = mensagem;

  useEffect(() => {
    if (exemplo || coordenadasUrl) return;
    void pedirLocalizacao()
      .then(setGeo)
      .catch((err) =>
        setMensagem(err instanceof Error ? err.message : UI.erroLocalizacao),
      );
  }, [exemplo, coordenadasUrl]);

  useEffect(() => {
    if (!exemplo || coordenadasUrl) return;
    void getExemploDoIndex()
      .then((ex) => {
        if (!ex) return;
        setFocoManual({ latlng: [ex.lat, ex.lng], rotulo: ex.rotulo });
      })
      .catch(() => {
        /* mapa ainda carrega por bounds */
      });
  }, [exemplo, coordenadasUrl]);

  const areaAmpla =
    bounds !== null &&
    (bounds.getNorth() - bounds.getSouth() > AREA_MAX_GRAUS ||
      bounds.getEast() - bounds.getWest() > AREA_MAX_GRAUS);

  useEffect(() => {
    if (!bounds || areaAmpla) return;
    let cancelado = false;
    void garantirLocaisParaBounds(bounds, exemplo)
      .then((l) => {
        if (!cancelado) setLocais(l);
      })
      .catch((e) =>
        setErro(e instanceof Error ? e.message : UI.erroCarregarDados),
      );
    return () => {
      cancelado = true;
    };
  }, [bounds, areaAmpla, exemplo]);

  const visiveis = useMemo(() => {
    if (!bounds || areaAmpla) return [];
    return locais.filter((l) => bounds.contains([l.lat, l.lng]));
  }, [locais, bounds, areaAmpla]);

  const { flavio, lula } = useMemo(() => ordenarLocais(visiveis), [visiveis]);

  const tf = visiveis.reduce((s, l) => s + l.flavio, 0);
  const tl = visiveis.reduce((s, l) => s + l.lula, 0);
  const d = tf - tl;

  const frase = areaAmpla
    ? UI.aproximeMapa
    : !visiveis.length
      ? UI.movaMapa
      : d >= 0
        ? UI.fraseVirar(fmt(Math.floor(d / 2) + 1))
        : UI.fraseLulaVence(fmt(-d));

  const localSel = locais.find((l) => l.id === selecionado) ?? null;

  const definirFoco = (latlng: LatLngTuple, label?: string) => {
    setFocoManual({ latlng, rotulo: label });
    setMensagem(null);
  };

  const onSelect = (id: string) => {
    setSelecionado(id);
    if (!desktop && locais.some((x) => x.id === id)) setAba('mapa');
  };

  const buscarCepForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) {
      setMensagem(UI.cepNumeros);
      return;
    }
    try {
      setMensagem(UI.procurandoCep);
      const { latlng, rotulo: cepRotulo } = await localizarCep(digits);
      definirFoco(latlng, cepRotulo);
    } catch (err) {
      setMensagem(err instanceof Error ? err.message : UI.falhaCep);
    }
  };

  if (erro) {
    return <p role="alert">{erro}</p>;
  }

  return (
    <div className="mapa-shell">
      {aviso ? (
        <p
          role="status"
          style={{
            position: 'fixed',
            zIndex: 50,
            top: 12,
            left: '50%',
            transform: "translateX('50%')",
            background: 'var(--color-foreground)',
            color: 'var(--color-background)',
            padding: '0.625rem 0.875rem',
            borderRadius: 4,
            fontSize: '0.8125rem',
            maxWidth: 'min(92vw, 28rem)',
          }}
        >
          {aviso}
        </p>
      ) : null}

      <header className="mapa-topo">
        <LogoCartaz size="sm" />
        <form className="busca" onSubmit={(e) => void buscarCepForm(e)}>
          <Input
            placeholder="Digite um CEP"
            aria-label="CEP"
            value={cep}
            onChange={(e) => setCep(e.target.value)}
          />
          <Button type="submit">OK</Button>
          <Button
            type="button"
            variant="ghost"
            aria-label={UI.usarLocalizacao}
            onClick={() => {
              void pedirLocalizacao()
                .then((p) => definirFoco(p, UI.voceAqui))
                .catch((err) =>
                  setMensagem(
                    err instanceof Error ? err.message : UI.erroLocalizacao,
                  ),
                );
            }}
          >
            <LocateFixed size={18} />
          </Button>
        </form>
      </header>

      <section className="mapa-resumo">
        <div>
          <p
            style={{
              fontSize: '0.6875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-muted-foreground)',
              margin: 0,
            }}
          >
            {UI.naAreaDoMapa}
          </p>
          <p className="frase">{frase}</p>
        </div>
        <div className="mapa-stats">
          {[
            ['Locais', fmt(visiveis.length), ''],
            ['Lula vence em', fmt(lula.length), 'red mapa-stat-lula-vence'],
            [UI.votosFlavio, fmt(tf), 'blue'],
            ['Votos Lula', fmt(tl), 'red'],
          ].map(([label, val, cls]) => (
            <div
              key={String(label)}
              className={`card mapa-stat ${cls}`}
              style={{
                padding: '0.5rem',
                border: '1px solid var(--color-border)',
                borderRadius: 4,
                background: 'var(--color-surface)',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '0.625rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-muted-foreground)',
                }}
              >
                {label}
              </p>
              <p
                style={{
                  margin: '0.25rem 0 0',
                  fontWeight: 600,
                  fontSize: '1.25rem',
                  fontVariantNumeric: 'tabular-nums',
                  color: cls.includes('red')
                    ? 'var(--color-accent-600)'
                    : cls.includes('blue')
                      ? '#2463bd'
                      : 'inherit',
                }}
              >
                {val}
              </p>
            </div>
          ))}
        </div>
      </section>

      <nav className="mapa-abas" aria-label={UI.visualizacao}>
        <Button
          type="button"
          variant={aba === 'mapa' ? 'default' : 'ghost'}
          onClick={() => setAba('mapa')}
        >
          Mapa
        </Button>
        <Button
          type="button"
          variant={aba === 'lista' ? 'default' : 'ghost'}
          onClick={() => setAba('lista')}
        >
          Lista
        </Button>
      </nav>

      <div className="mapa-corpo">
        <div className={`mapa-lista-wrap ${aba === 'lista' ? 'on' : ''}`}>
          <header className="mapa-lista-cab">
            <p
              style={{
                margin: 0,
                fontSize: '0.6875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--color-muted-foreground)',
              }}
            >
              Prioridade para conversa
            </p>
            <b style={{ display: 'block', marginTop: 4 }}>
              {visiveis.length
                ? UI.locaisOrdenados(visiveis.length)
                : UI.locaisNaArea}
            </b>
          </header>
          <div className="mapa-lista-scroll">
            <p
              style={{
                padding: '0.625rem 0.75rem 0.375rem',
                margin: 0,
                fontSize: '0.75rem',
                color: 'var(--color-muted-foreground)',
              }}
            >
              {UI.menorNumeroVirar}
            </p>
            <table className="mapa-tabela">
              <thead>
                <tr>
                  <th />
                  <th>Local</th>
                  <th className="n">Virar</th>
                  <th className="n">Conquistar</th>
                  <th className="n">{UI.diferenca}</th>
                </tr>
              </thead>
              <tbody>
                {flavio.map((l, i) => (
                  <tr
                    key={l.id}
                    className={l.id === selecionado ? 'sel' : ''}
                    onClick={() => onSelect(l.id)}
                  >
                    <td>{String(i + 1).padStart(2, '0')}</td>
                    <td>
                      <b>{l.nome}</b>
                      <small>
                        {l.municipio} {UI.sep} {l.bairro} {UI.sep}{' '}
                        {fmt(l.aptos)} aptos
                      </small>
                    </td>
                    <td className="n red">{fmt(l.virar)}</td>
                    <td className="n">
                      {l.conquistaBasta ? fmt(l.conquistar) : UI.naoBasta}
                    </td>
                    <td className="n">{pctAptos(l.pct)}</td>
                  </tr>
                ))}
                {lula.length > 0 ? (
                  <tr className="sec">
                    <td colSpan={5}>{UI.ondeLulaVence}</td>
                  </tr>
                ) : null}
                {lula.map((l) => (
                  <tr
                    key={l.id}
                    className={l.id === selecionado ? 'sel' : ''}
                    onClick={() => onSelect(l.id)}
                  >
                    <td aria-hidden="true" className="mapa-sym">
                      {UI.marcadorLulaVence}
                    </td>
                    <td>
                      <b>{l.nome}</b>
                      <small>
                        {l.municipio} {UI.sep} {l.bairro}
                      </small>
                    </td>
                    <td className="n mapa-sym">{UI.travessao}</td>
                    <td className="n mapa-sym">{UI.travessao}</td>
                    <td className="n">+{pctAptos(l.pct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div
          className={`mapa-mapa ${aba === 'lista' && !desktop ? 'off' : ''}`}
        >
          <MapaView
            locais={visiveis}
            center={center}
            zoom={zoom}
            selecionado={localSel}
            pontoUsuario={ponto}
            pontoRotulo={pontoRotulo}
            onBoundsChange={onBoundsChange}
            onSelect={onSelect}
            layoutKey={`${aba}-${desktop}`}
          />
        </div>
      </div>

      <Drawer
        open={localSel !== null}
        onOpenChange={(open) => {
          if (!open) setSelecionado(null);
        }}
      >
        <DrawerContent placement={desktop ? 'side' : 'bottom'}>
          <DrawerBody>
            {localSel ? <LocalDetailPanel local={localSel} /> : null}
          </DrawerBody>
          <DrawerClose aria-label="Fechar">Fechar</DrawerClose>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
