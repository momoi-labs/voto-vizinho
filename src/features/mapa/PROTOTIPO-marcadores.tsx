/*
 * PROTOTIPO — descartável. Variações de como representar no mapa os locais com
 * muitas abstenções + brancos + nulos, trocáveis por ?variant= na rota /mapa.
 * A variante escolhida será reescrita no código real; o resto vai embora.
 */
/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import L from 'leaflet';
import { Circle, CircleMarker, Marker, Tooltip } from 'react-leaflet';
import type { LocalAnalisado } from '../../domain/election';
import { fmt } from '../../lib/format';
import { UI } from '../../lib/ui-pt';

export const VARIANTES = [
  { key: 'atual', nome: 'Atual: miolo branco/preto' },
  { key: 'A', nome: 'Tamanho do pin' },
  { key: 'B', nome: 'Bolhas proporcionais' },
  { key: 'C', nome: 'Mancha de zona' },
  { key: 'D', nome: 'Número no marcador' },
  { key: 'E', nome: 'Ranking da lista' },
  { key: 'F', nome: 'Pin que enche' },
  { key: 'G', nome: 'Foco: só os prioritários' },
  { key: 'H', nome: 'Balão de conversa' },
  { key: 'I', nome: 'Camada alternável' },
] as const;

export type Variante = (typeof VARIANTES)[number]['key'];

const AZUL = '#2463bd';
const VERMELHO = 'var(--color-accent-600)';
const ROXOS = ['#ede9fe', '#c4b5fd', '#8b5cf6', '#6d28d9', '#3b0764'];

function lerVariante(): Variante {
  const v = new URLSearchParams(window.location.search).get('variant');
  return VARIANTES.some((x) => x.key === v) ? (v as Variante) : 'atual';
}

export function useVariante() {
  const [variante, setVariante] = useState<Variante>(lerVariante);
  const trocar = useCallback((v: Variante) => {
    const url = new URL(window.location.href);
    url.searchParams.set('variant', v);
    window.history.replaceState(window.history.state, '', url);
    setVariante(v);
  }, []);
  return [variante, trocar] as const;
}

const cor = (l: LocalAnalisado) => (l.lulaVence ? VERMELHO : AZUL);

function pinSvg(fill: string, size: number, miolo = '#fff', extra = '') {
  const w = Math.round(24 * size);
  const h = Math.round(32 * size);
  return `<svg width="${w}" height="${h}" viewBox="0 0 24 32" style="overflow:visible">${extra}<path d="M12 31s10-11.2 10-18.5C22 6.2 17.5 1.5 12 1.5S2 6.2 2 12.5C2 19.8 12 31 12 31z" fill="${fill}" stroke="#fff" stroke-width="1.6"/><circle cx="12" cy="12.5" r="3.6" fill="${miolo}"/></svg>`;
}

function pinIcon(html: string, w: number, h: number) {
  return L.divIcon({
    className: 'vv-marker',
    html,
    iconSize: [w, h],
    iconAnchor: [Math.round(w / 2), h],
  });
}

function TooltipLocal({
  l,
  offset = -28,
}: {
  l: LocalAnalisado;
  offset?: number;
}) {
  return (
    <Tooltip direction="top" offset={[0, offset]}>
      <strong>{l.nome}</strong>
      <br />
      {UI.tooltipVotos(fmt(l.flavio), fmt(l.lula))}
      <br />
      {UI.semVotoExp}: {fmt(l.semVoto)}
    </Tooltip>
  );
}

type MarcadoresProps = {
  variante: Exclude<Variante, 'atual'>;
  locais: LocalAnalisado[];
  destacados: ReadonlySet<string>;
  posicao: ReadonlyMap<string, number>;
  selecionadoId?: string;
  modoSemVoto: boolean;
  onSelect: (id: string) => void;
};

export function MarcadoresPrototipo({
  variante,
  locais,
  destacados,
  posicao,
  selecionadoId,
  modoSemVoto,
  onSelect,
}: MarcadoresProps) {
  const max = Math.max(1, ...locais.map((l) => l.semVoto));
  const pcts = locais.map((l) => (l.aptos ? l.semVoto / l.aptos : 0));
  const minPct = Math.min(...pcts);
  const faixaPct = Math.max(0.0001, Math.max(...pcts) - minPct);

  return (
    <>
      {variante === 'C'
        ? locais.map((l) => (
            <Circle
              key={`zona-${l.id}`}
              center={[l.lat, l.lng]}
              radius={60 + 260 * (l.semVoto / max)}
              pathOptions={{
                stroke: false,
                fillColor: '#a855f7',
                fillOpacity: 0.04 + 0.45 * (l.semVoto / max) ** 2,
              }}
              interactive={false}
            />
          ))
        : null}
      {locais.map((l) => {
        const r = l.semVoto / max;
        const sel = l.id === selecionadoId;
        const dest = destacados.has(l.id);
        const click = { click: () => onSelect(l.id) };
        const z = sel ? 1000 : Math.round(r * 500);

        if (variante === 'B') {
          return (
            <CircleMarker
              key={l.id}
              center={[l.lat, l.lng]}
              radius={4 + 18 * Math.sqrt(r)}
              pathOptions={{
                color: sel ? '#000' : '#fff',
                weight: sel ? 3 : 1.5,
                fillColor: l.lulaVence ? '#c0392b' : AZUL,
                fillOpacity: 0.6,
              }}
              eventHandlers={click}
            >
              <TooltipLocal l={l} offset={-8} />
            </CircleMarker>
          );
        }

        let html: string;
        let w: number;
        let h: number;
        let anchorCenter = false;

        switch (variante) {
          case 'A': {
            const s = (0.65 + 1.0 * r) * (sel ? 1.3 : 1);
            w = Math.round(24 * s);
            h = Math.round(32 * s);
            html = pinSvg(cor(l), s);
            break;
          }
          case 'C': {
            const s = sel ? 1.6 : 1;
            w = Math.round(24 * s);
            h = Math.round(32 * s);
            html = pinSvg(cor(l), s);
            break;
          }
          case 'D': {
            const big = dest || sel;
            const fs = big ? 13 : 10;
            const txt = fmt(l.semVoto);
            w = Math.round(txt.length * fs * 0.62 + (big ? 14 : 10));
            h = big ? 24 : 18;
            anchorCenter = true;
            html = `<div style="display:flex;align-items:center;justify-content:center;width:${w}px;height:${h}px;border-radius:${h}px;background:${cor(l)};color:#fff;font:${big ? 700 : 500} ${fs}px system-ui;border:${sel ? 3 : 1.5}px solid ${sel ? '#000' : '#fff'};box-shadow:0 1px 3px rgb(0 0 0 / .4);opacity:${big ? 1 : 0.85}">${txt}</div>`;
            break;
          }
          case 'E': {
            const p = posicao.get(l.id) ?? 999;
            const top = p <= 10;
            const d = top ? (sel ? 34 : 28) : sel ? 16 : 10;
            w = d;
            h = d;
            anchorCenter = true;
            html = top
              ? `<div style="display:flex;align-items:center;justify-content:center;width:${d}px;height:${d}px;border-radius:50%;background:${cor(l)};color:#fff;font:700 13px system-ui;border:2px solid ${sel ? '#000' : '#fff'};box-shadow:0 1px 4px rgb(0 0 0 / .45)">${p}</div>`
              : `<div style="width:${d}px;height:${d}px;border-radius:50%;background:${cor(l)};border:1.5px solid #fff;opacity:.7"></div>`;
            break;
          }
          case 'F': {
            const pct = l.aptos
              ? 0.1 + (0.9 * (l.semVoto / l.aptos - minPct)) / faixaPct
              : 0;
            const s = sel ? 1.6 : 1.25;
            w = Math.round(24 * s);
            h = Math.round(32 * s);
            const nivel = 31 - 29.5 * pct;
            const id = `f-${l.id}`;
            html = `<svg width="${w}" height="${h}" viewBox="0 0 24 32"><defs><clipPath id="${id}"><rect x="0" y="${nivel}" width="24" height="32"/></clipPath></defs><path d="M12 31s10-11.2 10-18.5C22 6.2 17.5 1.5 12 1.5S2 6.2 2 12.5C2 19.8 12 31 12 31z" fill="#fff" stroke="${cor(l)}" stroke-width="2.2"/><path clip-path="url(#${id})" d="M12 31s10-11.2 10-18.5C22 6.2 17.5 1.5 12 1.5S2 6.2 2 12.5C2 19.8 12 31 12 31z" fill="${cor(l)}"/></svg>`;
            break;
          }
          case 'G': {
            if (dest || sel) {
              const s = sel ? 1.6 : 1.2;
              w = Math.round(24 * s);
              h = Math.round(32 * s);
              html = pinSvg(cor(l), s);
            } else {
              w = 9;
              h = 9;
              anchorCenter = true;
              html = `<div style="width:9px;height:9px;border-radius:50%;background:${cor(l)};opacity:.45"></div>`;
            }
            break;
          }
          case 'H': {
            const s = sel ? 1.6 : 1;
            w = Math.round(24 * s);
            h = Math.round(32 * s);
            const balao = dest
              ? `<g transform="translate(11 -18) scale(1.7)"><path d="M1 1h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7l-4 3.5V13H1a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2z" fill="#fff" stroke="#111" stroke-width="1.4"/><circle cx="4.5" cy="7" r="1.2" fill="#111"/><circle cx="8" cy="7" r="1.2" fill="#111"/><circle cx="11.5" cy="7" r="1.2" fill="#111"/></g>`
              : '';
            html = pinSvg(cor(l), s, '#fff', '').replace(
              '</svg>',
              `${balao}</svg>`,
            );
            break;
          }
          case 'I': {
            const s = sel ? 1.6 : 1;
            w = Math.round(24 * s);
            h = Math.round(32 * s);
            const fill = modoSemVoto
              ? ROXOS[Math.min(4, Math.floor(r * 5))]
              : cor(l);
            html = pinSvg(fill, s, modoSemVoto ? '#111' : '#fff');
            break;
          }
        }

        const icon = anchorCenter
          ? L.divIcon({
              className: 'vv-marker',
              html,
              iconSize: [w, h],
              iconAnchor: [w / 2, h / 2],
            })
          : pinIcon(html, w, h);

        return (
          <Marker
            key={l.id}
            position={[l.lat, l.lng]}
            icon={icon}
            zIndexOffset={z}
            eventHandlers={click}
          >
            <TooltipLocal l={l} offset={anchorCenter ? -h / 2 : -h + 4} />
          </Marker>
        );
      })}
    </>
  );
}

function Item({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <li>
      {icone}
      {children}
    </li>
  );
}

const bola = (bg: string, d = 12, extra: React.CSSProperties = {}) => (
  <span
    style={{
      width: d,
      height: d,
      borderRadius: '50%',
      background: bg,
      flex: 'none',
      ...extra,
    }}
  />
);

const vence = (
  <>
    <Item icone={bola(VERMELHO)}>{UI.legendaLula}</Item>
    <Item icone={bola(AZUL)}>{UI.legendaFlavio}</Item>
  </>
);

export function LegendaPrototipo({
  variante,
  modoSemVoto,
  setModoSemVoto,
}: {
  variante: Exclude<Variante, 'atual'>;
  modoSemVoto: boolean;
  setModoSemVoto: (v: boolean) => void;
}) {
  const conteudo: Record<typeof variante, ReactNode> = {
    A: (
      <>
        {vence}
        <Item icone={bola('#888', 8)}>
          Pin pequeno: pouca gente sem candidato
        </Item>
        <Item icone={bola('#888', 16)}>
          Pin grande: muita gente sem candidato
        </Item>
      </>
    ),
    B: (
      <>
        {vence}
        <Item icone={bola('#888', 22, { opacity: 0.6 })}>
          Tamanho da bolha = abstenções + brancos + nulos
        </Item>
      </>
    ),
    C: (
      <>
        {vence}
        <Item icone={bola('#7c3aed', 16, { opacity: 0.4 })}>
          Mancha roxa: zona com muita gente sem candidato
        </Item>
      </>
    ),
    D: (
      <>
        {vence}
        <Item
          icone={
            <span
              style={{
                padding: '0 5px',
                borderRadius: 8,
                background: '#666',
                color: '#fff',
                fontWeight: 700,
              }}
            >
              579
            </span>
          }
        >
          Abstenções + brancos + nulos no local (destaque nos maiores)
        </Item>
      </>
    ),
    E: (
      <>
        {vence}
        <Item
          icone={
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: '#666',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              1
            </span>
          }
        >
          Posição na lista de prioridade (top 10)
        </Item>
      </>
    ),
    F: (
      <>
        {vence}
        <Item
          icone={bola('linear-gradient(to top, #666 60%, #fff 60%)', 14, {
            border: '1.5px solid #666',
          })}
        >
          Quanto mais cheio, maior a fatia de eleitores sem candidato
        </Item>
      </>
    ),
    G: (
      <>
        {vence}
        <Item icone={bola('#666', 14)}>Pin: muita gente sem candidato</Item>
        <Item icone={bola('#666', 7, { opacity: 0.45 })}>
          Ponto: os demais locais
        </Item>
      </>
    ),
    H: (
      <>
        {vence}
        <Item icone={<span style={{ fontSize: 13 }}>💬</span>}>
          Muita gente sem candidato: bom lugar para conversar
        </Item>
      </>
    ),
    I: (
      <>
        <li style={{ display: 'flex', gap: 4 }}>
          <button
            type="button"
            onClick={() => setModoSemVoto(false)}
            style={{ fontWeight: modoSemVoto ? 400 : 700 }}
          >
            Quem vence
          </button>
          <button
            type="button"
            onClick={() => setModoSemVoto(true)}
            style={{ fontWeight: modoSemVoto ? 700 : 400 }}
          >
            Sem candidato
          </button>
        </li>
        {modoSemVoto ? (
          <Item
            icone={
              <span
                style={{
                  width: 60,
                  height: 10,
                  background: `linear-gradient(to right, ${ROXOS.join(',')})`,
                }}
              />
            }
          >
            poucos → muitos sem candidato
          </Item>
        ) : (
          vence
        )}
      </>
    ),
  };
  return <ul className="mapa-legenda">{conteudo[variante]}</ul>;
}

export function TrocaVariante({
  variante,
  onChange,
}: {
  variante: Variante;
  onChange: (v: Variante) => void;
}) {
  const i = VARIANTES.findIndex((v) => v.key === variante);
  const ir = useCallback(
    (d: number) =>
      onChange(VARIANTES[(i + d + VARIANTES.length) % VARIANTES.length].key),
    [i, onChange],
  );
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('input, textarea, [contenteditable]')) return;
      if (e.key === 'ArrowLeft') ir(-1);
      if (e.key === 'ArrowRight') ir(1);
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [ir]);

  if (import.meta.env.PROD) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 10px',
        borderRadius: 999,
        background: '#111',
        color: '#fff',
        font: '600 13px system-ui',
        boxShadow: '0 4px 16px rgb(0 0 0 / .4)',
      }}
    >
      <button type="button" onClick={() => ir(-1)} style={{ color: '#fff' }}>
        ←
      </button>
      <span>
        {variante} ({VARIANTES[i].nome}) · {i + 1}/{VARIANTES.length}
      </span>
      <button type="button" onClick={() => ir(1)} style={{ color: '#fff' }}>
        →
      </button>
    </div>
  );
}
