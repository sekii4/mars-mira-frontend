import { useEffect, useState, useCallback } from 'react';
import { getRoute, type Checkpoint, type RoutePoint, type Stage } from '@/api/route';
import { getGroupLocations, type GroupMemberLocation } from '@/api/location';
import {
  getCheckpointVisits,
  getProgressSummary,
  recordManualCheckpointVisit,
  type CheckpointVisit,
  type ProgressSummary,
} from '@/api/checkpoint';
import type { MarchStatus } from '@/api/participation';
import type { LatLng } from '@/hooks/useGeolocation';
import { RouteMap } from '@/components/map/RouteMap';
import { StartFinishButton } from '@/components/StartFinishButton';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  MapPin,
  Route,
  Tent,
  Droplets,
  HeartPulse,
  Flag,
  Award,
  Loader2,
  AlertCircle,
  Navigation,
  CheckCircle2,
  Clock,
  Footprints,
  Check,
  Sparkles,
} from 'lucide-react';

const formatElapsed = (seconds?: number) => {
  if (!seconds || seconds <= 0) return '0 min';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  return `${mins} min`;
};

export const RouteMapPage = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedStageDay, setSelectedStageDay] = useState<number | null>(null);
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<number | null>(null);

  const [marchStatus, setMarchStatus] = useState<MarchStatus>('registered');
  const [ownLocation, setOwnLocation] = useState<LatLng | null>(null);
  const [groupLocations, setGroupLocations] = useState<GroupMemberLocation[]>([]);

  const [visits, setVisits] = useState<CheckpointVisit[]>([]);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState<number | null>(null);
  const [checkInNotice, setCheckInNotice] = useState<string | null>(null);

  const loadProgressAndVisits = async () => {
    try {
      const [visitsData, progressData] = await Promise.all([
        getCheckpointVisits(),
        getProgressSummary(),
      ]);
      setVisits(visitsData);
      setProgress(progressData);
    } catch (err: unknown) {
      console.warn('Greška pri dohvatu posjeta ili napretka:', err);
    }
  };

  useEffect(() => {
    const fetchRouteData = async () => {
      try {
        const [routeData] = await Promise.all([
          getRoute(),
          loadProgressAndVisits(),
        ]);
        setStages(routeData.stages);
        setCheckpoints(routeData.checkpoints);
        setPoints(routeData.points);
      } catch (err: unknown) {
        console.error('Greška pri učitavanju rute:', err);
        setError('Nije moguće učitati podatke o ruti. Provjerite konekciju.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRouteData();
  }, []);

  // Status se mijenja iz StartFinishButton-a; kad marš više nije aktivan, očisti prikaz grupe
  const handleStatusChange = (status: MarchStatus) => {
    setMarchStatus(status);
    loadProgressAndVisits();
    if (status !== 'active') {
      setGroupLocations([]);
    }
  };

  const handleManualCheckIn = async (cid: number) => {
    setIsCheckingIn(cid);
    try {
      const res = await recordManualCheckpointVisit(cid);
      if (res.success) {
        setCheckInNotice(res.message || 'Prolazak uspješno zabilježen!');
        setTimeout(() => setCheckInNotice(null), 4000);
        await loadProgressAndVisits();
      }
    } catch (err: unknown) {
      console.error('Greška pri ručnom check-inu:', err);
    } finally {
      setIsCheckingIn(null);
    }
  };

  const handleSelectCheckpoint = useCallback((cp: Checkpoint) => {
    setSelectedCheckpointId(cp.cid);
  }, []);

  // Dok je marš aktivan, periodično povuci najnovije lokacije članova grupe i napredak
  useEffect(() => {
    if (marchStatus !== 'active') {
      return;
    }

    const fetchPeriodicData = async () => {
      try {
        const res = await getGroupLocations();
        setGroupLocations(res.locations);
      } catch {
        // Tiho preskoči
      }
      loadProgressAndVisits();
    };

    fetchPeriodicData();
    const intervalId = setInterval(fetchPeriodicData, 20000);
    return () => clearInterval(intervalId);
  }, [marchStatus]);

  const filteredCheckpoints = selectedStageDay
    ? checkpoints.filter((cp) => cp.stage_day === selectedStageDay)
    : checkpoints;

  const getCheckpointIcon = (type: Checkpoint['type']) => {
    switch (type) {
      case 'start':
        return <Flag className="h-4 w-4 text-emerald-600" />;
      case 'camp':
        return <Tent className="h-4 w-4 text-indigo-600" />;
      case 'water':
        return <Droplets className="h-4 w-4 text-sky-600" />;
      case 'aid':
        return <HeartPulse className="h-4 w-4 text-rose-600" />;
      case 'finish':
        return <Award className="h-4 w-4 text-amber-600" />;
      default:
        return <MapPin className="h-4 w-4 text-emerald-600" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-linear-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 backdrop-blur-md rounded-full px-3 py-0.5 text-xs font-semibold">
              <Route className="h-3 w-3 mr-1.5" />
              <span>Interaktivna Leaflet Mapa</span>
            </Badge>
            <span className="text-xs text-emerald-200/80 font-medium">8. – 10. juli 2026.</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Trasa Marša Mira</h1>
          <p className="text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
            Historijska trasa duga ~100 kilometara od Nezuka do Memorijalnog centra Potočari podijeljena u tri etape sa označenim punktovima.
          </p>
          <div className="pt-1">
            <StartFinishButton
              onStatusChange={handleStatusChange}
              onPositionChange={setOwnLocation}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 z-10 self-start md:self-center shrink-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 px-4 text-center">
            <div className="text-xl sm:text-2xl font-black text-white">~100 km</div>
            <div className="text-[11px] text-emerald-200 font-semibold uppercase">Ukupna dužina</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 px-4 text-center">
            <div className="text-xl sm:text-2xl font-black text-white">15</div>
            <div className="text-[11px] text-emerald-200 font-semibold uppercase">Punktova</div>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Check-in Notification Banner */}
      {checkInNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-2.5 text-sm font-semibold shadow-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{checkInNotice}</span>
        </div>
      )}

      {/* Participant Progress Overview Card */}
      <Card className="p-5 sm:p-6 rounded-3xl border-border bg-card/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">Vaš napredak na maršu</h2>
              <p className="text-xs text-muted-foreground">
                Zabilježeno {progress?.visitedCheckpoints ?? 0} od {checkpoints.length || 15} punktova ({progress?.progressPercentage ?? 0}%)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs gap-1.5 font-semibold bg-muted/40 border-border">
              <Footprints className="h-3.5 w-3.5 text-emerald-600" />
              <span>~{progress?.completedDistanceKm ?? 0} km / {progress?.totalDistanceKm ?? 100} km</span>
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1 text-xs gap-1.5 font-semibold bg-muted/40 border-border">
              <Clock className="h-3.5 w-3.5 text-emerald-600" />
              <span>{formatElapsed(progress?.elapsedSeconds)} hodanja</span>
            </Badge>
          </div>
        </div>

        <div className="space-y-1.5">
          <Progress
            value={progress?.progressPercentage ?? 0}
            className="h-2.5 bg-emerald-100 rounded-full"
          />
          <div className="flex justify-between items-center text-[11px] font-medium text-muted-foreground pt-0.5">
            <span>Start (Nezuk)</span>
            <span>Dan 1: Liplje</span>
            <span>Dan 2: Mravinjci</span>
            <span>Cilj (Potočari)</span>
          </div>
        </div>
      </Card>

      {/* Stage Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={selectedStageDay === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setSelectedStageDay(null);
            setSelectedCheckpointId(null);
          }}
          className={`rounded-full h-10 px-5 text-sm font-semibold cursor-pointer transition-all ${
            selectedStageDay === null
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
              : 'border-border text-foreground hover:bg-emerald-50'
          }`}
        >
          Sve etape (100 km)
        </Button>
        <Button
          type="button"
          variant={selectedStageDay === 1 ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setSelectedStageDay(1);
            setSelectedCheckpointId(null);
          }}
          className={`rounded-full h-10 px-5 text-sm font-semibold cursor-pointer transition-all ${
            selectedStageDay === 1
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
              : 'border-border text-foreground hover:bg-emerald-50'
          }`}
        >
          1. dan: Nezuk → Liplje (~35 km)
        </Button>
        <Button
          type="button"
          variant={selectedStageDay === 2 ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setSelectedStageDay(2);
            setSelectedCheckpointId(null);
          }}
          className={`rounded-full h-10 px-5 text-sm font-semibold cursor-pointer transition-all ${
            selectedStageDay === 2
              ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
              : 'border-border text-foreground hover:bg-teal-50'
          }`}
        >
          2. dan: Liplje → Mravinjci (~35 km)
        </Button>
        <Button
          type="button"
          variant={selectedStageDay === 3 ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setSelectedStageDay(3);
            setSelectedCheckpointId(null);
          }}
          className={`rounded-full h-10 px-5 text-sm font-semibold cursor-pointer transition-all ${
            selectedStageDay === 3
              ? 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-sm'
              : 'border-border text-foreground hover:bg-emerald-50'
          }`}
        >
          3. dan: Mravinjci → Potočari (~30 km)
        </Button>
      </div>

      {/* Main Map + Checkpoints Layout */}
      {isLoading ? (
        <Card className="h-150 flex items-center justify-center rounded-3xl border-border">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <span className="font-semibold text-sm">Učitavanje rute i punktova...</span>
          </div>
        </Card>
      ) : error ? (
        <Card className="p-8 rounded-3xl border-rose-200 bg-rose-50 flex items-center gap-3 text-rose-800">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <span className="font-semibold">{error}</span>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Map Column (8 cols on large screens) */}
          <div className="lg:col-span-8 h-[520px] sm:h-[620px] lg:h-[680px] w-full">
            <RouteMap
              stages={stages}
              checkpoints={checkpoints}
              points={points}
              selectedStageDay={selectedStageDay}
              selectedCheckpointId={selectedCheckpointId}
              onSelectCheckpoint={handleSelectCheckpoint}
              className="h-full w-full"
              ownLocation={ownLocation}
              groupLocations={groupLocations}
              visits={visits}
            />
          </div>

          {/* Checkpoints Sidebar Column (4 cols on large screens) */}
          <Card className="lg:col-span-4 h-[520px] sm:h-[620px] lg:h-[680px] flex flex-col rounded-3xl border-border p-5 sm:p-6 shadow-sm overflow-hidden [--card-spacing:0]">
            <div className="pb-4 border-b border-border/70 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground text-base sm:text-lg">
                  Punktovi ({filteredCheckpoints.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Kliknite na punkt za prikaz i fokus na mapi
                </p>
              </div>
              <Navigation className="h-4 w-4 text-emerald-600" />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pt-3 pr-1">
              {filteredCheckpoints.map((cp) => {
                const isSelected = selectedCheckpointId === cp.cid;
                const visit = visits.find((v) => v.checkpoint_id === cp.cid);
                const isVisited = Boolean(visit);

                return (
                  <div
                    key={cp.cid}
                    onClick={() => setSelectedCheckpointId(cp.cid)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-border/60 hover:border-emerald-300 hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-xl bg-background border border-border/80 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                        {getCheckpointIcon(cp.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-bold text-sm text-foreground truncate">
                            {cp.name}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            {isVisited && visit ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="h-3 w-3 text-emerald-600" />
                                <span>Prošao</span>
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-[10px] text-muted-foreground border-border px-2 py-0.5 rounded-full"
                              >
                                Predstoji
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 rounded-md font-semibold shrink-0"
                            >
                              {cp.stage_day}. dan
                            </Badge>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {cp.description}
                        </p>
                      </div>
                    </div>

                    {/* Visit Status Details or Manual Check-in Button */}
                    {isVisited && visit ? (
                      <div className="pt-2 border-t border-emerald-200/50 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Zabilježeno u {new Date(visit.reached_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ) : marchStatus === 'active' ? (
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-muted-foreground">Ovdje ste?</span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isCheckingIn === cp.cid}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleManualCheckIn(cp.cid);
                          }}
                          className="h-7 text-xs rounded-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold px-3 cursor-pointer"
                        >
                          {isCheckingIn === cp.cid ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                          )}
                          Zabilježi prolazak
                        </Button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};