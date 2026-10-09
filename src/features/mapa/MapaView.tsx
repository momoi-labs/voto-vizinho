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

function pinHtml(fill: string, size = 1) {
  const w = Math.round(24 * size);
  const h = Math.round(32 * size);
  return `<svg width="${w}" height="${h}" viewBox="0 0 24 32"><path d="M12 31s10-11.2 10-18.5C22 6.2 17.5 1.5 12 1.5S2 6.2 2 12.5C2 19.8 12 31 12 31z" fill="${fill}" stroke="#fff" stroke-width="1.6"/><circle cx="12" cy="12.5" r="3.6" fill="#fff"/></svg>`;
}

function icone(local: LocalAnalisado, sel: boolean) {
  const lula = local.lulaVence;
  const scale = sel ? 1.2 : 1;
  const fill = lula ? 'var(--color-accent-600)' : '#2463bd';
  const w = Math.round(24 * scale);
  const h = Math.round(32 * scale);
  return L.divIcon({
    className: `vv-marker pin${lula ? ' lula' : ''}${sel ? ' sel' : ''}`,
    html: pinHtml(fill, scale),
    iconSize: [w, h],
    iconAnchor: [Math.round(w / 2), h],
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
  center,
  zoom,
  selecionado,
  pontoUsuario,
  pontoRotulo,
  onBoundsChange,
  onSelect,
  layoutKey,
}: Props) {
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
      {locais.map((l) => (
        <Marker
          key={l.id}
          position={[l.lat, l.lng]}
          icon={icone(l, l.id === selecionado?.id)}
          zIndexOffset={l.id === selecionado?.id ? 200 : l.lulaVence ? 50 : 0}
          eventHandlers={{ click: () => onSelect(l.id) }}
        >
          <Tooltip direction="top" offset={[0, -28]}>
            <strong>{l.nome}</strong>
            <br />
            {UI.tooltipVotos(fmt(l.flavio), fmt(l.lula))}
          </Tooltip>
        </Marker>
      ))}
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
