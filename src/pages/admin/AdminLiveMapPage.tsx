import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  getAdminLiveLocations,
  type AdminLiveParticipant,
  type AdminLiveLocationsResponse,
  type ParticipantFreshness,
} from '@/api/admin';
import { getRoute, type Checkpoint, type RoutePoint } from '@/api/route';
import { getApiErrorMessage } from '@/api/errors';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Activity,
  ArrowLeft,
  ChevronRight,
  Clock3,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  Pause,
  Play,
  RefreshCw,
  Route,
  Search,
  Users,
  AlertCircle,
} from 'lucide-react';

const STAGE_COLORS: Record<number, string> = {
  1: '#10B981', // Emerald 500 (Dan 1)
  2: '#0D9488', // Teal 600 (Dan 2)
  3: '#047857', // Emerald 700 (Dan 3)
};

const FRESHNESS_CONFIG: Record<
  ParticipantFreshness,
  { label: string; bgClass: string; textClass: string; borderClass: string; dotClass: string; pinBg: string }
> = {
  fresh: {
    label: 'U pokretu (< 5 min)',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
    dotClass: 'bg-emerald-500',
    pinBg: '#10B981',
  },
  moderate: {
    label: 'Umjereno (5-30 min)',
    bgClass: 'bg-amber-50 dark:bg-amber-950/40',
    textClass: 'text-amber-700 dark:text-amber-400',
    borderClass: 'border-amber-200 dark:border-amber-800',
    dotClass: 'bg-amber-500',
    pinBg: '#F59E0B',
  },
  stale: {
    label: 'Neaktivno (> 30 min)',
    bgClass: 'bg-slate-100 dark:bg-slate-800/60',
    textClass: 'text-slate-600 dark:text-slate-400',
    borderClass: 'border-slate-200 dark:border-slate-700',
    dotClass: 'bg-slate-400',
    pinBg: '#64748B',
  },
};

export const AdminLiveMapPage = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylinesLayerRef = useRef<L.LayerGroup | null>(null);
  const checkpointsLayerRef = useRef<L.LayerGroup | null>(null);
  const participantsLayerRef = useRef<L.LayerGroup | null>(null);
  const participantMarkersRef = useRef<Map<number, L.Marker>>(new Map());
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const hasInitialFitRef = useRef(false);

  // Data states
  const [liveData, setLiveData] = useState<AdminLiveLocationsResponse | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // UI & control states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mapType, setMapType] = useState<'osm' | 'topo'>('osm');
  const [selectedStageDay, setSelectedStageDay] = useState<number | null>(null);
  const [showCheckpoints, setShowCheckpoints] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const [selectedParticipantId, setSelectedParticipantId] = useState<number | null>(null);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [freshnessFilter, setFreshnessFilter] = useState<'all' | ParticipantFreshness>('all');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');

  // Polling settings
  const [pollIntervalSec, setPollIntervalSec] = useState<number>(15); // 0 = paused
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState<number>(15);

  // Fetch route and checkpoints on mount
  useEffect(() => {
    let isMounted = true;
    const fetchRouteData = async () => {
      try {
        const routeData = await getRoute();
        if (isMounted) {
          setCheckpoints(routeData.checkpoints || []);
          setRoutePoints(routeData.points || []);
        }
      } catch (err) {
        console.error('Error fetching route for live map:', err);
      }
    };
    fetchRouteData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch live locations
  const fetchLocations = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    }
    setErrorMessage('');
    try {
      const data = await getAdminLiveLocations();
      setLiveData(data);
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, 'Greška pri preuzimanju lokacija učesnika.'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setSecondsUntilRefresh(pollIntervalSec);
    }
  }, [pollIntervalSec]);

  // Initial load
  useEffect(() => {
    fetchLocations(false);
  }, [fetchLocations]);

  // Polling countdown ticker
  useEffect(() => {
    if (pollIntervalSec <= 0) return;

    const timer = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          fetchLocations(false);
          return pollIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pollIntervalSec, fetchLocations]);

  // Handle poll interval switch
  const handleIntervalChange = (val: number) => {
    setPollIntervalSec(val);
    setSecondsUntilRefresh(val > 0 ? val : 0);
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [44.25, 19.05], // Central Podrinje region
      zoom: 11,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const tileOsm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });

    tileOsm.addTo(map);
    baseTileLayerRef.current = tileOsm;

    polylinesLayerRef.current = L.layerGroup().addTo(map);
    checkpointsLayerRef.current = L.layerGroup().addTo(map);
    participantsLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Map Type change
  const toggleMapType = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }

    const nextType = mapType === 'osm' ? 'topo' : 'osm';
    setMapType(nextType);

    const newLayer =
      nextType === 'topo'
        ? L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data: &copy; OpenTopoMap contributors',
            maxZoom: 17,
          })
        : L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
          });

    newLayer.addTo(map);
    baseTileLayerRef.current = newLayer;
  };

  // Render Route polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !polylinesLayerRef.current) return;

    polylinesLayerRef.current.clearLayers();

    if (!showRoute || routePoints.length === 0) return;

    const byDay: Record<number, [number, number][]> = {};
    routePoints.forEach((pt) => {
      const day = pt.stage_day || 1;
      if (selectedStageDay !== null && day !== selectedStageDay) return;
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push([pt.lat, pt.long]);
    });

    Object.entries(byDay).forEach(([dayStr, coords]) => {
      const dayNum = Number(dayStr);
      const color = STAGE_COLORS[dayNum] || '#10B981';

      // Outer glow polyline
      L.polyline(coords, {
        color: '#FFFFFF',
        weight: 6,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(polylinesLayerRef.current!);

      // Primary styled trail line
      L.polyline(coords, {
        color,
        weight: 4,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(polylinesLayerRef.current!);
    });
  }, [routePoints, selectedStageDay, showRoute]);

  // Render Checkpoints
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !checkpointsLayerRef.current) return;

    checkpointsLayerRef.current.clearLayers();

    if (!showCheckpoints || checkpoints.length === 0) return;

    checkpoints.forEach((cp) => {
      if (selectedStageDay !== null && cp.stage_day !== selectedStageDay) return;

      let iconHtml = '📍';
      let bgStyle = 'background-color:#10B981;color:#ffffff;';

      if (cp.type === 'start') {
        iconHtml = '🏁';
        bgStyle = 'background-color:#059669;color:#ffffff;box-shadow:0 0 0 3px rgba(16,185,129,0.3);';
      } else if (cp.type === 'camp') {
        iconHtml = '⛺';
        bgStyle = 'background-color:#4F46E5;color:#ffffff;box-shadow:0 0 0 3px rgba(79,70,229,0.3);';
      } else if (cp.type === 'aid') {
        iconHtml = '✚';
        bgStyle = 'background-color:#E11D48;color:#ffffff;box-shadow:0 0 0 3px rgba(225,29,72,0.3);';
      } else if (cp.type === 'water') {
        iconHtml = '💧';
        bgStyle = 'background-color:#0284C7;color:#ffffff;box-shadow:0 0 0 3px rgba(2,132,199,0.3);';
      } else if (cp.type === 'finish') {
        iconHtml = '⭐';
        bgStyle = 'background-color:#047857;color:#FDE047;border:2px solid #FDE047;';
      }

      const cpIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="width:26px;height:26px;border-radius:9999px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;border:2px solid #ffffff;${bgStyle}cursor:pointer;">
            ${iconHtml}
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const popupHtml = `
        <div style="font-family:inherit;min-width:180px;padding:4px 0;">
          <div style="font-size:13px;font-weight:800;color:#0f172a;margin-bottom:2px;">${cp.name}</div>
          <div style="font-size:11px;color:#64748b;margin-bottom:6px;">Dan ${cp.stage_day} • Tip: ${cp.type}</div>
          ${cp.description ? `<div style="font-size:11px;color:#334155;line-height:1.4;">${cp.description}</div>` : ''}
        </div>
      `;

      L.marker([cp.lat, cp.long], { icon: cpIcon })
        .bindPopup(popupHtml)
        .addTo(checkpointsLayerRef.current!);
    });
  }, [checkpoints, selectedStageDay, showCheckpoints]);

  // Filter participants
  const filteredParticipants = useMemo(() => {
    if (!liveData?.participants) return [];

    return liveData.participants.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
        const email = p.email.toLowerCase();
        const group = (p.group_name || '').toLowerCase();
        const city = (p.city || '').toLowerCase();
        if (
          !fullName.includes(query) &&
          !email.includes(query) &&
          !group.includes(query) &&
          !city.includes(query)
        ) {
          return false;
        }
      }

      // Freshness filter
      if (freshnessFilter !== 'all' && p.freshness !== freshnessFilter) {
        return false;
      }

      // Group filter
      if (selectedGroupFilter !== 'all') {
        if (selectedGroupFilter === 'independent' && p.group_id !== null) {
          return false;
        }
        if (selectedGroupFilter !== 'independent' && String(p.group_id) !== selectedGroupFilter) {
          return false;
        }
      }

      return true;
    });
  }, [liveData?.participants, searchQuery, freshnessFilter, selectedGroupFilter]);

  // Unique groups for filter dropdown
  const uniqueGroups = useMemo(() => {
    if (!liveData?.participants) return [];
    const map = new Map<number, string>();
    liveData.participants.forEach((p) => {
      if (p.group_id && p.group_name) {
        map.set(p.group_id, p.group_name);
      }
    });
    return Array.from(map.entries()).map(([gid, name]) => ({ gid, name }));
  }, [liveData?.participants]);

  // Render Participant Live Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !participantsLayerRef.current) return;

    participantsLayerRef.current.clearLayers();
    participantMarkersRef.current.clear();

    const bounds = L.latLngBounds([]);

    filteredParticipants.forEach((p) => {
      const isSelected = selectedParticipantId === p.uid;
      const initials = `${p.first_name?.[0] ?? ''}${p.last_name?.[0] ?? ''}`.toUpperCase() || 'U';
      const config = FRESHNESS_CONFIG[p.freshness] || FRESHNESS_CONFIG.stale;

      const markerHtml = `
        <div style="position:relative;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform 0.2s;" class="${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
          ${
            p.freshness === 'fresh'
              ? `<span style="position:absolute;width:34px;height:34px;border-radius:9999px;background-color:rgba(16,185,129,0.35);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>`
              : ''
          }
          <div style="position:relative;width:30px;height:30px;border-radius:9999px;background-color:#ffffff;border:3px solid ${config.pinBg};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,0.18);">
            <span style="font-size:11px;font-weight:900;color:${config.pinBg};letter-spacing:-0.5px;">${initials}</span>
          </div>
          <span style="position:absolute;bottom:-2px;right:-2px;width:10px;height:10px;border-radius:9999px;background-color:${config.pinBg};border:2px solid #ffffff;"></span>
        </div>
      `;

      const markerIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: markerHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([p.latitude, p.longitude], {
        icon: markerIcon,
        zIndexOffset: isSelected ? 3000 : p.freshness === 'fresh' ? 2000 : 1000,
      });

      const recordedTimeStr = new Date(p.recorded_at).toLocaleTimeString('bs-BA', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const popupContent = `
        <div style="font-family:inherit;min-width:240px;padding:4px 0;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <div style="width:28px;height:28px;border-radius:9999px;background-color:${config.pinBg};color:#ffffff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;">
              ${initials}
            </div>
            <div>
              <div style="font-size:14px;font-weight:800;color:#0f172a;line-height:1.2;">
                ${p.first_name} ${p.last_name}
              </div>
              <div style="font-size:11px;color:#64748b;">${p.email}</div>
            </div>
          </div>

          <div style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:9999px;background-color:${config.pinBg}18;color:${config.pinBg};font-size:11px;font-weight:700;margin-bottom:8px;">
            <span style="width:6px;height:6px;border-radius:9999px;background-color:${config.pinBg};"></span>
            ${config.label} (${p.minutes_ago} min)
          </div>

          <div style="display:grid;grid-template-columns:1fr;gap:4px;font-size:11px;border-top:1px solid #e2e8f0;padding-top:8px;">
            <div style="display:flex;justify-content:space-between;color:#475569;">
              <span>Tim / Grupa:</span>
              <strong style="color:#0f172a;">${p.group_name || 'Samostalno'}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;color:#475569;">
              <span>Zadnje slanje:</span>
              <strong style="color:#0f172a;">${recordedTimeStr}</strong>
            </div>
            ${
              p.last_checkpoint
                ? `
                <div style="display:flex;justify-content:space-between;color:#475569;">
                  <span>Zadnji punkt:</span>
                  <strong style="color:#059669;">${p.last_checkpoint.name}</strong>
                </div>
              `
                : ''
            }
            ${
              p.city || p.country
                ? `
                <div style="display:flex;justify-content:space-between;color:#475569;">
                  <span>Lokacija:</span>
                  <strong style="color:#0f172a;">${[p.city, p.country].filter(Boolean).join(', ')}</strong>
                </div>
              `
                : ''
            }
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        setSelectedParticipantId(p.uid);
      });

      marker.addTo(participantsLayerRef.current!);
      participantMarkersRef.current.set(p.uid, marker);

      bounds.extend([p.latitude, p.longitude]);
    });

    // Fit bounds on first data load if valid
    if (!hasInitialFitRef.current && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      hasInitialFitRef.current = true;
    }
  }, [filteredParticipants, selectedParticipantId]);

  // Focus on a specific participant
  const handleFocusParticipant = (participant: AdminLiveParticipant) => {
    setSelectedParticipantId(participant.uid);
    const map = mapInstanceRef.current;
    if (!map) return;

    map.flyTo([participant.latitude, participant.longitude], 15, {
      duration: 1.0,
    });

    const marker = participantMarkersRef.current.get(participant.uid);
    if (marker) {
      setTimeout(() => marker.openPopup(), 400);
    }
  };

  // Fit all bounds
  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const bounds = L.latLngBounds([]);

    // Add participants
    filteredParticipants.forEach((p) => bounds.extend([p.latitude, p.longitude]));

    // Add checkpoints if visible
    if (showCheckpoints) {
      checkpoints.forEach((cp) => bounds.extend([cp.lat, cp.long]));
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  };

  const totalActive = liveData?.total_active || 0;
  const freshCount = liveData?.fresh_count || 0;
  const moderateCount = liveData?.moderate_count || 0;
  const staleCount = liveData?.stale_count || 0;

  return (
    <div className="relative w-full h-[calc(100vh-5rem)] flex overflow-hidden bg-background">
      {/* MAP CANVAS (FULL CONTAINER) */}
      <div className="relative flex-1 h-full w-full">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* TOP FLOATING OVERLAY: BREADCRUMB & MAP TOOLS */}
        <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-3">
          {/* Top Left: Title & Quick Nav */}
          <div className="pointer-events-auto flex items-center gap-2 bg-card/90 backdrop-blur-md border border-border/80 shadow-md rounded-2xl px-3.5 py-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-muted"
            >
              <Link to="/admin" title="Nazad na Administratorski panel">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="h-4 w-px bg-border/80" />
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <div>
                <div className="text-xs font-black tracking-tight text-foreground uppercase flex items-center gap-1.5">
                  <span>Live Mapa</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-300 text-emerald-800 bg-emerald-50/70">
                    {totalActive} aktivnih
                  </Badge>
                </div>
                <div className="text-[10px] font-semibold text-muted-foreground hidden sm:block">
                  Marš Mira Srebrenica • Koordinacija uživo
                </div>
              </div>
            </div>
          </div>

          {/* Top Right: Layer & View Controls */}
          <div className="pointer-events-auto flex items-center gap-2 bg-card/90 backdrop-blur-md border border-border/80 shadow-md rounded-2xl p-1.5">
            {/* Stage Selector */}
            <div className="hidden md:flex items-center gap-1 pr-1 border-r border-border/80">
              <Button
                variant={selectedStageDay === null ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedStageDay(null)}
                className={`h-7 px-2.5 text-xs rounded-xl font-bold ${
                  selectedStageDay === null ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
                }`}
              >
                Sve etape
              </Button>
              {[1, 2, 3].map((day) => (
                <Button
                  key={day}
                  variant={selectedStageDay === day ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedStageDay(day)}
                  className={`h-7 px-2 text-xs rounded-xl font-bold ${
                    selectedStageDay === day ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''
                  }`}
                >
                  Dan {day}
                </Button>
              ))}
            </div>

            {/* Route Layer Toggle */}
            <Button
              variant={showRoute ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowRoute(!showRoute)}
              className={`h-7 px-2.5 text-xs rounded-xl font-semibold ${
                showRoute ? 'bg-emerald-700 text-white hover:bg-emerald-800' : 'text-muted-foreground'
              }`}
              title="Prikaži / Sakrij trasu"
            >
              <Route className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Trasa</span>
            </Button>

            {/* Checkpoints Layer Toggle */}
            <Button
              variant={showCheckpoints ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowCheckpoints(!showCheckpoints)}
              className={`h-7 px-2.5 text-xs rounded-xl font-semibold ${
                showCheckpoints ? 'bg-emerald-700 text-white hover:bg-emerald-800' : 'text-muted-foreground'
              }`}
              title="Prikaži / Sakrij punktove"
            >
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Punktovi</span>
            </Button>

            {/* Map Topo/OSM Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMapType}
              className="h-7 px-2.5 text-xs rounded-xl font-semibold"
              title="Prebaci stil mape"
            >
              <Layers className="h-3.5 w-3.5 mr-1 text-emerald-600" />
              <span>{mapType === 'osm' ? 'Standard' : 'Topografska'}</span>
            </Button>

            {/* Fit all bounds */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleFitAll}
              className="h-7 w-7 p-0 rounded-xl"
              title="Prikaži sve na mapi"
            >
              <Maximize2 className="h-3.5 w-3.5 text-foreground" />
            </Button>

            {/* Sidebar toggle button */}
            <Button
              variant={isSidebarOpen ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`h-7 px-2.5 text-xs rounded-xl font-bold ${
                isSidebarOpen ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''
              }`}
            >
              <Users className="h-3.5 w-3.5 mr-1" />
              <span>{isSidebarOpen ? 'Sakrij panel' : 'Prikaži učesnike'}</span>
            </Button>
          </div>
        </div>

        {/* BOTTOM FLOATING STATUS BAR: AUTO-REFRESH & INTERVALS */}
        <div className="absolute bottom-4 left-4 z-20 pointer-events-auto bg-card/90 backdrop-blur-md border border-border/80 shadow-md rounded-2xl px-3.5 py-2 flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchLocations(true)}
              disabled={isRefreshing}
              className="h-7 px-2 text-xs rounded-xl font-bold hover:bg-emerald-50 text-emerald-800"
              title="Ručno osvježi"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Osvježi</span>
            </Button>

            <div className="h-3.5 w-px bg-border/80" />

            <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
              <Clock3 className="h-3.5 w-3.5 text-emerald-600" />
              {pollIntervalSec > 0 ? (
                <span>
                  Ažuriranje za:{' '}
                  <strong className="text-foreground font-mono">{secondsUntilRefresh}s</strong>
                </span>
              ) : (
                <span className="text-amber-600 font-semibold">Pauzirano</span>
              )}
            </div>
          </div>

          <div className="h-3.5 w-px bg-border/80 hidden sm:block" />

          {/* Quick Interval Selection */}
          <div className="hidden sm:flex items-center gap-1">
            <span className="text-[11px] text-muted-foreground font-medium">Interval:</span>
            {[10, 15, 30, 60].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => handleIntervalChange(sec)}
                className={`px-1.5 py-0.5 rounded-md text-[11px] font-bold transition-colors ${
                  pollIntervalSec === sec
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-black'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {sec}s
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleIntervalChange(pollIntervalSec === 0 ? 15 : 0)}
              className={`p-1 rounded-md text-[11px] transition-colors ${
                pollIntervalSec === 0
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              title={pollIntervalSec === 0 ? 'Pokreni automatsko ažuriranje' : 'Pauziraj'}
            >
              {pollIntervalSec === 0 ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
            </button>
          </div>
        </div>

        {/* ERROR NOTIFICATION BANNER */}
        {errorMessage && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl px-4 py-2 shadow-lg flex items-center gap-2 text-xs font-bold animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchLocations(false)}
              className="h-6 px-2 text-[11px] rounded-lg bg-white ml-2"
            >
              Ponovi
            </Button>
          </div>
        )}
      </div>

      {/* COLLAPSIBLE SIDE DRAWER PANEL */}
      <div
        className={`relative z-10 w-full sm:w-96 lg:w-[420px] h-full bg-card border-l border-border flex flex-col shadow-2xl transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full absolute right-0'
        }`}
      >
        {/* Panel Header */}
        <div className="p-4 sm:p-5 border-b border-border/80 bg-muted/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shadow-2xs">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-foreground tracking-tight uppercase">
                  Aktivni Učesnici
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Ukupno locirano: <strong className="text-foreground">{totalActive}</strong>
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
              className="h-8 w-8 p-0 rounded-full"
              title="Zatvori panel"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick KPI Freshness Counters Bar */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <button
              type="button"
              onClick={() => setFreshnessFilter(freshnessFilter === 'fresh' ? 'all' : 'fresh')}
              className={`p-2 rounded-xl border transition-all text-left ${
                freshnessFilter === 'fresh'
                  ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 ring-2 ring-emerald-200'
                  : 'border-border/70 bg-background hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Svježe</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 leading-none">
                {freshCount}
              </div>
              <div className="text-[10px] text-muted-foreground">&lt; 5 min</div>
            </button>

            <button
              type="button"
              onClick={() => setFreshnessFilter(freshnessFilter === 'moderate' ? 'all' : 'moderate')}
              className={`p-2 rounded-xl border transition-all text-left ${
                freshnessFilter === 'moderate'
                  ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 ring-2 ring-amber-200'
                  : 'border-border/70 bg-background hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Umjereno</span>
                <span className="h-2 w-2 rounded-full bg-amber-500" />
              </div>
              <div className="text-lg font-black text-amber-700 dark:text-amber-400 leading-none">
                {moderateCount}
              </div>
              <div className="text-[10px] text-muted-foreground">5-30 min</div>
            </button>

            <button
              type="button"
              onClick={() => setFreshnessFilter(freshnessFilter === 'stale' ? 'all' : 'stale')}
              className={`p-2 rounded-xl border transition-all text-left ${
                freshnessFilter === 'stale'
                  ? 'border-slate-400 bg-slate-100 dark:bg-slate-800/70 ring-2 ring-slate-200'
                  : 'border-border/70 bg-background hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Zastoj</span>
                <span className="h-2 w-2 rounded-full bg-slate-400" />
              </div>
              <div className="text-lg font-black text-slate-700 dark:text-slate-300 leading-none">
                {staleCount}
              </div>
              <div className="text-[10px] text-muted-foreground">&gt; 30 min</div>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Pretraži po imenu, timu ili gradu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 rounded-xl text-xs bg-background border-border/80"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Dropdown & Clear */}
          <div className="flex items-center gap-2">
            <select
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
              className="flex-1 h-8 rounded-xl border border-border/80 bg-background px-2.5 text-xs font-semibold text-foreground"
            >
              <option value="all">Sve grupe i timovi</option>
              <option value="independent">Samostalni učesnici</option>
              {uniqueGroups.map((g) => (
                <option key={g.gid} value={String(g.gid)}>
                  Grupa: {g.name}
                </option>
              ))}
            </select>

            {(freshnessFilter !== 'all' || selectedGroupFilter !== 'all' || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFreshnessFilter('all');
                  setSelectedGroupFilter('all');
                  setSearchQuery('');
                }}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-rose-600"
              >
                Poništi
              </Button>
            )}
          </div>
        </div>

        {/* Participant List (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 divide-y divide-border/30">
          {isLoading && !liveData ? (
            <div className="p-8 text-center space-y-2 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-600" />
              <p className="text-xs font-semibold">Učitavanje aktivnih učesnika...</p>
            </div>
          ) : filteredParticipants.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Nema pronađenih učesnika</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalActive === 0
                    ? 'Trenutno nema učesnika sa aktivnim maršem i zabilježenom lokacijom.'
                    : 'Niti jedan učesnik ne odgovara odabranim filterima ili pretrazi.'}
                </p>
              </div>
              {(freshnessFilter !== 'all' || selectedGroupFilter !== 'all' || searchQuery) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFreshnessFilter('all');
                    setSelectedGroupFilter('all');
                    setSearchQuery('');
                  }}
                  className="rounded-full text-xs"
                >
                  Očisti filtere
                </Button>
              )}
            </div>
          ) : (
            filteredParticipants.map((p) => {
              const isSelected = selectedParticipantId === p.uid;
              const config = FRESHNESS_CONFIG[p.freshness] || FRESHNESS_CONFIG.stale;
              const initials = `${p.first_name?.[0] ?? ''}${p.last_name?.[0] ?? ''}`.toUpperCase() || 'U';

              return (
                <div
                  key={p.uid}
                  onClick={() => handleFocusParticipant(p)}
                  className={`pt-2.5 first:pt-0 cursor-pointer group`}
                >
                  <Card
                    className={`rounded-2xl p-3 border transition-all hover:shadow-md ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm ring-1 ring-emerald-300'
                        : 'border-border/70 hover:border-emerald-300 bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="relative h-9 w-9 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 shadow-2xs"
                          style={{ backgroundColor: config.pinBg }}
                        >
                          {initials}
                          <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${config.dotClass}`} />
                        </div>

                        <div>
                          <div className="text-xs font-black text-foreground group-hover:text-emerald-700 transition-colors">
                            {p.first_name} {p.last_name}
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate max-w-44">
                            {p.group_name ? `Grupa: ${p.group_name}` : 'Samostalni učesnik'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0.5 font-bold rounded-full ${config.borderClass} ${config.bgClass} ${config.textClass}`}
                        >
                          {p.minutes_ago === 0 ? 'Upravo sad' : `prije ${p.minutes_ago}m`}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1 truncate max-w-48">
                        <Navigation className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          {p.last_checkpoint ? p.last_checkpoint.name : 'Na trasi marša'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                        <span>Prikaži</span>
                        <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })
          )}
        </div>

        {/* Panel Footer */}
        <div className="p-3 border-t border-border/80 bg-muted/20 text-center text-[11px] text-muted-foreground">
          Prikazano: <strong className="text-foreground">{filteredParticipants.length}</strong> od{' '}
          <strong className="text-foreground">{totalActive}</strong> aktivnih učesnika
        </div>
      </div>
    </div>
  );
};
