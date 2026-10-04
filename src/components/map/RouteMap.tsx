import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Checkpoint, RoutePoint, Stage } from '@/api/route';
import type { GroupMemberLocation } from '@/api/location';
import type { LatLng } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { Layers, RotateCcw } from 'lucide-react';

interface RouteMapProps {
  stages?: Stage[];
  checkpoints: Checkpoint[];
  points: RoutePoint[];
  selectedStageDay: number | null; // null = all
  selectedCheckpointId: number | null;
  onSelectCheckpoint?: (checkpoint: Checkpoint) => void;
  className?: string;
  // Live praćenje tokom marša - oboje opciono, mapa radi isto kao prije i bez njih
  ownLocation?: LatLng | null;
  groupLocations?: GroupMemberLocation[];
}

const STAGE_COLORS: Record<number, string> = {
  1: '#10B981', // Emerald 500 (Dan 1)
  2: '#0D9488', // Teal 600 (Dan 2)
  3: '#047857', // Emerald 700 (Dan 3)
};

export const RouteMap = ({
  stages = [],
  checkpoints,
  points,
  selectedStageDay,
  selectedCheckpointId,
  onSelectCheckpoint,
  className = 'h-full w-full',
  ownLocation = null,
  groupLocations = [],
}: RouteMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylinesLayerRef = useRef<L.LayerGroup | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markersMapRef = useRef<Map<number, L.Marker>>(new Map());
  const liveLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapType, setMapType] = useState<'osm' | 'topo'>('osm');
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);

  // Helper to create branded DivIcon for each checkpoint type
  const createMarkerIcon = (cp: Checkpoint, isSelected: boolean) => {
    let bgClass = 'bg-emerald-600 text-white border-white';
    let label = '📍';

    if (cp.type === 'start') {
      bgClass = 'bg-emerald-500 text-white border-white ring-4 ring-emerald-200';
      label = '🏁';
    } else if (cp.type === 'camp') {
      bgClass = 'bg-indigo-600 text-white border-white ring-4 ring-indigo-200';
      label = '⛺';
    } else if (cp.type === 'aid') {
      bgClass = 'bg-rose-500 text-white border-white ring-4 ring-rose-200';
      label = '✚';
    } else if (cp.type === 'water') {
      bgClass = 'bg-sky-500 text-white border-white ring-4 ring-sky-200';
      label = '💧';
    } else if (cp.type === 'finish') {
      bgClass = 'bg-emerald-800 text-amber-300 border-amber-300 ring-4 ring-amber-200/80';
      label = '⭐';
    }

    const scaleClass = isSelected ? 'scale-125 z-50 shadow-xl' : 'hover:scale-110 shadow-md';

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${scaleClass}">
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${bgClass}">
            <span>${label}</span>
          </div>
          ${
            isSelected
              ? '<span class="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full animate-ping"></span>'
              : ''
          }
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -18],
    });
  };

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered around Eastern Bosnia route corridor (between Nezuk and Srebrenica)
    const map = L.map(mapContainerRef.current, {
      center: [44.318, 19.135],
      zoom: 11,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    baseTileLayerRef.current = tileLayer;

    polylinesLayerRef.current = L.layerGroup().addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    liveLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Handle Map Type switch (OSM vs Topo)
  useEffect(() => {
    if (!mapInstanceRef.current || !baseTileLayerRef.current) return;

    const url =
      mapType === 'topo'
        ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    baseTileLayerRef.current.setUrl(url);
  }, [mapType]);

  // 3. Render Route Polylines and Checkpoint Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !polylinesLayerRef.current || !markersLayerRef.current) return;

    polylinesLayerRef.current.clearLayers();
    markersLayerRef.current.clearLayers();
    markersMapRef.current.clear();

    const bounds = L.latLngBounds([]);

    // Draw route polylines grouped by stage
    const pointsByStage: Record<number, L.LatLngExpression[]> = { 1: [], 2: [], 3: [] };

    points.forEach((pt) => {
      const stage = pt.stage_day || 1;
      if (!pointsByStage[stage]) pointsByStage[stage] = [];
      const latLng: [number, number] = [pt.lat, pt.long];
      pointsByStage[stage].push(latLng);

      if (!selectedStageDay || selectedStageDay === stage) {
        bounds.extend(latLng);
      }
    });

    [1, 2, 3].forEach((stage) => {
      const stagePts = pointsByStage[stage];
      if (!stagePts || stagePts.length === 0) return;

      const isCurrent = !selectedStageDay || selectedStageDay === stage;
      const color = STAGE_COLORS[stage] || '#10B981';

      const polyline = L.polyline(stagePts, {
        color: isCurrent ? color : '#94A3B8',
        weight: isCurrent ? 5 : 2.5,
        opacity: isCurrent ? 0.9 : 0.4,
        dashArray: isCurrent ? undefined : '4, 8',
        lineCap: 'round',
        lineJoin: 'round',
      });

      polyline.addTo(polylinesLayerRef.current!);
    });

    // Draw checkpoint markers
    checkpoints.forEach((cp) => {
      const isVisibleStage = !selectedStageDay || selectedStageDay === cp.stage_day;
      if (!isVisibleStage) return;

      const isSelected = selectedCheckpointId === cp.cid;
      const marker = L.marker([cp.lat, cp.long], {
        icon: createMarkerIcon(cp, isSelected),
        zIndexOffset: isSelected ? 1000 : 0,
      });

      const typeBadge =
        cp.type === 'start'
          ? '<span style="background:#ECFDF5;color:#065F46;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;">START</span>'
          : cp.type === 'camp'
          ? '<span style="background:#EEF2FF;color:#3730A3;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;">KAMP / PRENOĆIŠTE</span>'
          : cp.type === 'aid'
          ? '<span style="background:#FFF1F2;color:#9F1239;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;">PRVA POMOĆ</span>'
          : cp.type === 'water'
          ? '<span style="background:#F0F9FF;color:#0369A1;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;">OKREPA & VODA</span>'
          : '<span style="background:#FEF3C7;color:#92400E;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;">CILJ</span>';

      const popupContent = `
        <div style="font-family: inherit; min-width: 200px; padding: 4px;">
          <div style="margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between; gap: 8px;">
            ${typeBadge}
            <span style="font-size: 11px; font-weight: 600; color: #64748B;">Etapa ${cp.stage_day}. dan</span>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; color: #0F172A;">${cp.name}</h4>
          <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.4;">${cp.description}</p>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectCheckpoint) {
          onSelectCheckpoint(cp);
        }
      });

      marker.addTo(markersLayerRef.current!);
      markersMapRef.current.set(cp.cid, marker);
      bounds.extend([cp.lat, cp.long]);
    });

    // Fit bounds if we have valid coordinates
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [points, checkpoints, selectedStageDay, selectedCheckpointId, onSelectCheckpoint]);

  // 4. Focus on selected checkpoint
  useEffect(() => {
    if (!selectedCheckpointId || !mapInstanceRef.current) return;
    const marker = markersMapRef.current.get(selectedCheckpointId);
    if (marker) {
      const latLng = marker.getLatLng();
      mapInstanceRef.current.flyTo(latLng, 14, { duration: 1.2 });
      marker.openPopup();
    }
  }, [selectedCheckpointId]);

  // 5. Live markeri: vlastita lokacija + lokacije članova grupe (nezavisno od rute/punktova,
  // da česta GPS ažuriranja ne ponovo iscrtavaju cijelu rutu)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !liveLayerRef.current) return;

    liveLayerRef.current.clearLayers();

    if (ownLocation) {
      const ownIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute w-5 h-5 bg-sky-400/50 rounded-full animate-ping"></span>
            <div class="relative w-4 h-4 rounded-full bg-sky-600 border-2 border-white shadow-md"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker([ownLocation.latitude, ownLocation.longitude], {
        icon: ownIcon,
        zIndexOffset: 2000,
      })
        .bindPopup('<div style="font-size:12px;font-weight:700;">Vaša lokacija</div>')
        .addTo(liveLayerRef.current);
    }

    groupLocations.forEach((member) => {
      const initials = `${member.first_name?.[0] ?? ''}${member.last_name?.[0] ?? ''}`.toUpperCase();
      const memberIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-indigo-600 border-2 border-white shadow-md">
            ${initials}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const recordedAt = new Date(member.recorded_at).toLocaleTimeString('bs-BA', {
        hour: '2-digit',
        minute: '2-digit',
      });

      L.marker([member.latitude, member.longitude], {
        icon: memberIcon,
        zIndexOffset: 1500,
      })
        .bindPopup(
          `<div style="font-size:12px;"><strong>${member.first_name} ${member.last_name}</strong><br/>Ažurirano: ${recordedAt}</div>`
        )
        .addTo(liveLayerRef.current!);
    });
  }, [ownLocation, groupLocations]);

  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([]);
    points.forEach((pt) => {
      if (!selectedStageDay || selectedStageDay === pt.stage_day) {
        bounds.extend([pt.lat, pt.long]);
      }
    });
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  };

  return (
    <div className={`relative ${className} overflow-hidden rounded-3xl border border-border/80 shadow-md bg-muted/20`}>
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-400 flex flex-col gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setMapType((prev) => (prev === 'osm' ? 'topo' : 'osm'))}
          className="rounded-full bg-white/95 backdrop-blur-md shadow-md hover:bg-white text-slate-800 text-xs font-semibold gap-1.5 h-9 px-3 border-border"
          title="Promijeni sloj karte"
        >
          <Layers className="h-3.5 w-3.5 text-emerald-600" />
          <span>{mapType === 'osm' ? 'Teren (Topo)' : 'Standardna'}</span>
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleResetView}
          className="rounded-full bg-white/95 backdrop-blur-md shadow-md hover:bg-white text-slate-800 text-xs font-semibold gap-1.5 h-9 px-3 border-border"
          title="Centriraj rutu"
        >
          <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
          <span>Centriraj</span>
        </Button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 z-400 bg-white/95 backdrop-blur-md rounded-2xl border border-border/70 p-3 shadow-lg hidden sm:flex flex-col gap-2 text-xs">
        <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">Legenda rute</div>
        <div className="flex items-center gap-3">
          {stages.length > 0 ? (
            stages.map((st) => (
              <div key={st.rid} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-1.5 rounded-full"
                  style={{ backgroundColor: STAGE_COLORS[st.stage_day] || '#10B981' }}
                />
                <span className="text-slate-600 font-medium">
                  {st.stage_day}. dan (~{Math.round(st.distance)} km)
                </span>
              </div>
            ))
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded-full bg-emerald-500" />
                <span className="text-slate-600">1. dan (~35 km)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded-full bg-teal-600" />
                <span className="text-slate-600">2. dan (~35 km)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded-full bg-emerald-800" />
                <span className="text-slate-600">3. dan (~30 km)</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};