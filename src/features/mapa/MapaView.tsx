import { useEffect } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';
import type { LatLngBounds, LatLngTuple } from 'leaflet';
import type { LocalAnalisado } from '../../domain/election';
import { fmt } from '../../lib/format';
import { UI } from '../../lib/ui-pt';

const ROTULO = {
  normal: { fonte: 10, folga: 10, h: 18 },
  destaque: { fonte: 13, folga: 14, h: 24 },
  sel: { fonte: 15, folga: 20, h: 30 },
};

function icone(local: LocalAnalisado, sel: boolean, destaque: boolean) {
  const texto = fmt(local.semVoto);
  const { fonte, folga, h } =
    ROTULO[sel ? 'sel' : destaque ? 'destaque' : 'normal'];
  const w = Math.round(texto.length * fonte * 0.62 + folga);
  const classes = [
    'vv-rotulo',
    local.lulaVence ? 'lula' : 'flavio',
    destaque ? 'destaque' : '',
    sel ? 'sel' : '',
  ].join(' ');
  return L.divIcon({
    className: 'vv-marker',
    html: `<span class="${classes}" style="width:${w}px;height:${h}px">${texto}</span>`,
    iconSize: [w, h],
    iconAnchor: [Math.round(w / 2), Math.round(h / 2)],
  });
}

function BoundsWatcher({
  onChange,
  layoutKey,
}: {
  onChange: (b: LatLngBounds) => void;
  layoutKey: string;
}) {
  const map = useMap();

  useEffect(() => {
    let raf = 0;
    const report = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => onChange(map.getBounds()));
    };

    map.on('moveend', report);
    map.on('zoomend', report);
    map.on('resize', report);

    const t1 = window.setTimeout(() => {
      map.invalidateSize();
      report();
    }, 0);
    const t2 = window.setTimeout(() => {
      map.invalidateSize();
      report();
    }, 300);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      if (raf) cancelAnimationFrame(raf);
      map.off('moveend', report);
      map.off('zoomend', report);
      map.off('resize', report);
    };
  }, [map, onChange, layoutKey]);
  return null;
}

function FlyTo({ center, zoom }: { center: LatLngTuple; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    const cur = map.getCenter();
    const same =
      Math.abs(cur.lat - center[0]) < 1e-6 &&
      Math.abs(cur.lng - center[1]) < 1e-6 &&
      map.getZoom() === zoom;
    if (same) return;
    map.setView(center, zoom, { animate: true });
  }, [map, center, zoom]);
  return null;
}

function MostrarSelecionado({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.panInside([lat, lng], { padding: [48, 48] });
  }, [map, lat, lng]);
  return null;
}

type Props = {
  locais: LocalAnalisado[];
  destacados: ReadonlySet<string>;
  center: LatLngTuple;
  zoom: number;
  selecionado: LocalAnalisado | null;
  pontoUsuario: LatLngTuple | null;
  pontoRotulo?: string;
  onBoundsChange: (b: LatLngBounds) => void;
  onSelect: (id: string) => void;
  layoutKey: string;
};

export function MapaView({
  locais,
  destacados,
  center,
  zoom,
  selecionado,
  pontoUsuario,
  pontoRotulo,
  onBoundsChange,
  onSelect,
  layoutKey,
}: Props) {
  const maxSemVoto = Math.max(0, ...locais.map((l) => l.semVoto));
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo center={center} zoom={zoom} />
      <BoundsWatcher onChange={onBoundsChange} layoutKey={layoutKey} />
      {selecionado ? (
        <MostrarSelecionado lat={selecionado.lat} lng={selecionado.lng} />
      ) : null}
      {locais.map((l) => {
        const sel = l.id === selecionado?.id;
        const destaque = destacados.has(l.id);
        return (
          <Marker
            key={l.id}
            position={[l.lat, l.lng]}
            icon={icone(l, sel, destaque)}
            zIndexOffset={sel ? 1000 + maxSemVoto : l.semVoto}
            eventHandlers={{ click: () => onSelect(l.id) }}
          >
            <Tooltip
              direction="top"
              offset={[0, sel ? -15 : destaque ? -12 : -9]}
            >
              <strong>{l.nome}</strong>
              <br />
              {UI.tooltipVotos(fmt(l.flavio), fmt(l.lula))}
              <br />
              {UI.semVotoExp}: {fmt(l.semVoto)}
            </Tooltip>
          </Marker>
        );
      })}
      {pontoUsuario ? (
        <Marker
          position={pontoUsuario}
          icon={L.divIcon({
            className: '',
            html: '<div style="width:16px;height:16px;border-radius:50%;background:var(--color-foreground);border:3px solid var(--color-surface)"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          })}
        >
          <Tooltip>{pontoRotulo ?? 'Você está aqui'}</Tooltip>
        </Marker>
      ) : null}
    </MapContainer>
  );
}
