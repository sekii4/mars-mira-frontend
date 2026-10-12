import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Checkpoint, CheckpointType, RoutePoint } from '@/api/route';

export interface MapPosition {
  lat: number;
  long: number;
}

export interface MapFocus extends MapPosition {
  zoom?: number;
}

interface CheckpointPlacementMapProps {
  points: RoutePoint[];
  checkpoints: Checkpoint[];
  draft: MapPosition | null;
  draftType: CheckpointType;
  focus: MapFocus | null;
  onMapClick: (pos: MapPosition) => void;
  onDraftMove: (pos: MapPosition) => void;
  onSelectCheckpoint: (checkpoint: Checkpoint) => void;
  className?: string;
}

export const CHECKPOINT_VISUAL: Record<CheckpointType, { emoji: string; color: string; label: string }> = {
  start: { emoji: '🏁', color: '#10B981', label: 'Start' },
  checkpoint: { emoji: '📍', color: '#059669', label: 'Punkt' },
  camp: { emoji: '⛺', color: '#4F46E5', label: 'Kamp' },
  aid: { emoji: '✚', color: '#F43F5E', label: 'Prva pomoć' },
  water: { emoji: '💧', color: '#0EA5E9', label: 'Voda' },
  finish: { emoji: '⭐', color: '#065F46', label: 'Cilj' },
};

const STAGE_COLORS: Record<number, string> = {
  1: '#10B981',
  2: '#0D9488',
  3: '#047857',
};

const buildIcon = (type: CheckpointType, isDraft: boolean) => {
  const visual = CHECKPOINT_VISUAL[type] ?? CHECKPOINT_VISUAL.checkpoint;
  const ring = isDraft ? 'box-shadow:0 0 0 4px #FDE68A,0 4px 10px rgba(0,0,0,.35);' : 'box-shadow:0 2px 6px rgba(0,0,0,.3);';
  const size = isDraft ? 38 : 32;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${visual.color};border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:${isDraft ? 16 : 14}px;color:#fff;font-weight:700;${ring}">${visual.emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

export const CheckpointPlacementMap = ({
  points,
  checkpoints,
  draft,
  draftType,
  focus,
  onMapClick,
  onDraftMove,
  onSelectCheckpoint,
  className = 'h-full w-full',
}: CheckpointPlacementMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const checkpointLayerRef = useRef<L.LayerGroup | null>(null);
  const draftMarkerRef = useRef<L.Marker | null>(null);
  const hasFitRef = useRef(false);

  // Najnoviji handleri, da se Leaflet događaji ne moraju ponovo registrovati pri svakom renderu
  const handlersRef = useRef({ onMapClick, onDraftMove, onSelectCheckpoint });
  useEffect(() => {
    handlersRef.current = { onMapClick, onDraftMove, onSelectCheckpoint };
  });

  // 1. Inicijalizacija mape
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [44.25, 19.2],
      zoom: 10,
      zoomControl: false,
      preferCanvas: true,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: ['a', 'b', 'c'],
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    routeLayerRef.current = L.layerGroup().addTo(map);
    checkpointLayerRef.current = L.layerGroup().addTo(map);

    map.on('click', (e: L.LeafletMouseEvent) => {
      handlersRef.current.onMapClick({ lat: e.latlng.lat, long: e.latlng.lng });
    });

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      draftMarkerRef.current = null;
    };
  }, []);

  // 2. Fiksna ruta (samo za prikaz)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !routeLayerRef.current) return;

    routeLayerRef.current.clearLayers();
    const bounds = L.latLngBounds([]);

    const byStage: Record<number, L.LatLngTuple[]> = {};
    [...points]
      .sort((a, b) => a.order_index - b.order_index)
      .forEach((pt) => {
        const stage = pt.stage_day || 1;
        (byStage[stage] ||= []).push([pt.lat, pt.long]);
        bounds.extend([pt.lat, pt.long]);
      });

    Object.entries(byStage).forEach(([stage, latLngs]) => {
      L.polyline(latLngs, {
        color: STAGE_COLORS[Number(stage)] || '#10B981',
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false,
      }).addTo(routeLayerRef.current!);
    });

    if (!hasFitRef.current && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
      hasFitRef.current = true;
    }
  }, [points]);

  // 3. Postojeći punktovi
  useEffect(() => {
    if (!checkpointLayerRef.current) return;
    checkpointLayerRef.current.clearLayers();

    checkpoints.forEach((cp) => {
      const marker = L.marker([cp.lat, cp.long], { icon: buildIcon(cp.type, false) });

      // textContent umjesto HTML-a, da naziv punkta ne može ubaciti markup
      const label = document.createElement('div');
      label.textContent = cp.name;
      marker.bindTooltip(label, { direction: 'top', offset: [0, -16] });

      marker.on('click', () => handlersRef.current.onSelectCheckpoint(cp));
      marker.addTo(checkpointLayerRef.current!);
    });
  }, [checkpoints]);

  // 4. Marker koji se postavlja / pomjera (nov punkt ili punkt koji se uređuje)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!draft) {
      draftMarkerRef.current?.remove();
      draftMarkerRef.current = null;
      return;
    }

    if (draftMarkerRef.current) {
      draftMarkerRef.current.setLatLng([draft.lat, draft.long]);
      draftMarkerRef.current.setIcon(buildIcon(draftType, true));
      return;
    }

    const marker = L.marker([draft.lat, draft.long], {
      icon: buildIcon(draftType, true),
      draggable: true,
      zIndexOffset: 1000,
    });
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      handlersRef.current.onDraftMove({ lat: pos.lat, long: pos.lng });
    });
    marker.addTo(map);
    draftMarkerRef.current = marker;
  }, [draft, draftType]);

  // 5. Pomjeri pogled na rezultat pretrage / odabrani punkt
  useEffect(() => {
    if (!focus || !mapRef.current) return;
    mapRef.current.flyTo([focus.lat, focus.long], focus.zoom ?? 14, { duration: 0.8 });
  }, [focus]);

  return (
    <div className={`relative ${className} overflow-hidden rounded-3xl border border-border/80 shadow-md bg-muted/20`}>
      <div ref={containerRef} className="h-full w-full z-0" />
    </div>
  );
};