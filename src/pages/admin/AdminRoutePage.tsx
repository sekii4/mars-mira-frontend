import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { getRoute, type Stage, type Checkpoint, type RoutePoint, type CheckpointType } from '@/api/route';
import { createCheckpoint, updateCheckpoint, deleteCheckpoint } from '@/api/adminRoute';
import { searchPlaces, type PlaceResult } from '@/api/geocode';
import { getApiErrorMessage } from '@/api/errors';
import {
  CheckpointPlacementMap,
  CHECKPOINT_VISUAL,
  type MapFocus,
  type MapPosition,
} from '@/components/map/CheckpointPlacementMap';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Search, Loader2, AlertCircle, MapPin, Trash2, X, MousePointerClick } from 'lucide-react';

const CHECKPOINT_TYPES: CheckpointType[] = ['checkpoint', 'start', 'camp', 'aid', 'water', 'finish'];

const emptyForm = { name: '', description: '', type: 'checkpoint' as CheckpointType };

export const AdminRoutePage = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Marker koji se postavlja (nov punkt) ili pomjera (punkt koji se uređuje)
  const [draft, setDraft] = useState<MapPosition | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [focus, setFocus] = useState<MapFocus | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const applyRoute = (res: Awaited<ReturnType<typeof getRoute>>) => {
    setStages(res.stages);
    setCheckpoints(res.checkpoints);
    setPoints(res.points);
  };

  // Prvo učitavanje
  useEffect(() => {
    getRoute()
      .then((res) => {
        setStages(res.stages);
        setCheckpoints(res.checkpoints);
        setPoints(res.points);
      })
      .catch((err: unknown) => setErrorMessage(getApiErrorMessage(err, 'Nije moguće učitati rutu.')))
      .finally(() => setIsLoading(false));
  }, []);

  // Osvježavanje nakon izmjene
  const reloadRoute = async () => {
    try {
      applyRoute(await getRoute());
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, 'Nije moguće osvježiti rutu.'));
    }
  };

  const resetEditor = () => {
    setDraft(null);
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
  };

  // --- Mapa ---
  const handleMapClick = (pos: MapPosition) => {
    if (!draft && editingId === null) {
      setForm(emptyForm);
    }
    setFormError('');
    setDraft(pos);
  };

  const handleSelectCheckpoint = (cp: Checkpoint) => {
    setEditingId(cp.cid);
    setDraft({ lat: cp.lat, long: cp.long });
    setForm({ name: cp.name, description: cp.description || '', type: cp.type });
    setFormError('');
    setFocus({ lat: cp.lat, long: cp.long, zoom: 14 });
  };

  // --- Pretraga mjesta ---
  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchMessage('');
    setSearchResults([]);
    try {
      const results = await searchPlaces(query);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchMessage('Nema rezultata. Pokušajte drugi naziv ili kliknite direktno na mapu.');
      }
    } catch (err: unknown) {
      setSearchMessage(getApiErrorMessage(err, 'Pretraga trenutno nije dostupna. Kliknite direktno na mapu.'));
    } finally {
      setIsSearching(false);
    }
  };

  const handlePickResult = (place: PlaceResult) => {
    if (!draft && editingId === null) {
      setForm({ ...emptyForm, name: place.name });
    } else if (editingId === null && !form.name) {
      setForm((current) => ({ ...current, name: place.name }));
    }
    setFormError('');
    setDraft({ lat: place.lat, long: place.long });
    setFocus({ lat: place.lat, long: place.long, zoom: 14 });
    setSearchResults([]);
    setSearchMessage('');
  };

  // --- Čuvanje / brisanje ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;

    setFormError('');
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        type: form.type,
        lat: draft.lat,
        long: draft.long,
      };
      if (editingId !== null) {
        await updateCheckpoint(editingId, payload);
      } else {
        await createCheckpoint(payload);
      }
      resetEditor();
      await reloadRoute();
    } catch (err: unknown) {
      setFormError(getApiErrorMessage(err, 'Spremanje punkta nije uspjelo.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (editingId === null) return;
    if (!confirm(`Obrisati punkt "${form.name}"? Briše se i evidencija učesnika koji su ga prošli.`)) return;

    setIsSubmitting(true);
    try {
      await deleteCheckpoint(editingId);
      resetEditor();
      await reloadRoute();
    } catch (err: unknown) {
      setFormError(getApiErrorMessage(err, 'Brisanje punkta nije uspjelo.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const mapCheckpoints = checkpoints.filter((c) => c.cid !== editingId);
  const isEditorOpen = draft !== null || editingId !== null;

  const checkpointsByDay = [...checkpoints]
    .sort((a, b) => a.stage_day - b.stage_day || a.order_index - b.order_index)
    .reduce<Record<number, Checkpoint[]>>((groups, cp) => {
      (groups[cp.stage_day] ||= []).push(cp);
      return groups;
    }, {});

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-12 space-y-6">
      <Button asChild variant="ghost" className="rounded-full gap-2 -ml-3 font-semibold">
        <Link to="/admin">
          <ArrowLeft className="h-4 w-4" />
          <span>Nazad na admin panel</span>
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Punktovi na ruti</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ruta je fiksna. Pronađite mjesto po nazivu ili kliknite na mapu, pa odaberite o kakvom je punktu riječ.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="font-semibold text-sm">Učitavanje rute...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa + pretraga */}
          <div className="lg:col-span-2 space-y-3">
            <div className="relative">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pretraga mjesta, npr. Kravica, Potočari, Konjević Polje..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 rounded-xl pl-10"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="h-11 rounded-xl cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  <span>Traži</span>
                </Button>
              </form>

              {(searchResults.length > 0 || searchMessage) && (
                <Card className="absolute z-1100 left-0 right-0 top-13 rounded-2xl border-border shadow-lg p-2 [--card-spacing:0]">
                  {searchResults.map((place, i) => (
                    <button
                      key={`${place.lat}-${place.long}-${i}`}
                      type="button"
                      onClick={() => handlePickResult(place)}
                      className="w-full text-left rounded-xl px-3 py-2.5 hover:bg-emerald-50 cursor-pointer transition-colors"
                    >
                      <div className="text-sm font-semibold text-foreground">{place.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{place.displayName}</div>
                    </button>
                  ))}
                  {searchMessage && <div className="px-3 py-2.5 text-sm text-muted-foreground">{searchMessage}</div>}
                </Card>
              )}
            </div>

            <CheckpointPlacementMap
              points={points}
              checkpoints={mapCheckpoints}
              draft={draft}
              draftType={form.type}
              focus={focus}
              onMapClick={handleMapClick}
              onDraftMove={setDraft}
              onSelectCheckpoint={handleSelectCheckpoint}
              className="h-105 lg:h-150 w-full"
            />
          </div>

          {/* Forma + lista */}
          <div className="space-y-6">
            {isEditorOpen ? (
              <Card className="rounded-3xl border-emerald-200 p-5 sm:p-6 [--card-spacing:0] space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-foreground">{editingId !== null ? 'Uredi punkt' : 'Novi punkt'}</h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetEditor}
                    className="rounded-full cursor-pointer h-8 w-8 p-0"
                    title="Zatvori"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {draft ? (
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-600" />
                    <span>
                      Lokacija je označena na mapi. Prevucite marker ili kliknite drugdje da je pomjerite.
                    </span>
                  </p>
                ) : null}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cp-name">Naziv</Label>
                    <Input
                      id="cp-name"
                      required
                      maxLength={150}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Vrsta punkta</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {CHECKPOINT_TYPES.map((type) => {
                        const visual = CHECKPOINT_VISUAL[type];
                        const selected = form.type === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => setForm({ ...form, type })}
                            className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-semibold cursor-pointer transition-colors ${
                              selected
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                                : 'border-border text-muted-foreground hover:bg-muted/50'
                            }`}
                          >
                            <span className="text-base leading-none">{visual.emoji}</span>
                            <span>{visual.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cp-description">Opis (nije obavezan)</Label>
                    <textarea
                      id="cp-description"
                      rows={2}
                      maxLength={500}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  {formError && (
                    <div className="flex items-start gap-2 text-sm font-semibold text-rose-700">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !draft}
                      className="rounded-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
                    >
                      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>{editingId !== null ? 'Sačuvaj izmjene' : 'Dodaj punkt'}</span>
                    </Button>
                    {editingId !== null && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={handleDelete}
                        className="rounded-full cursor-pointer gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Obriši</span>
                      </Button>
                    )}
                  </div>
                </form>
              </Card>
            ) : (
              <Card className="rounded-3xl border-dashed border-emerald-200 bg-emerald-50/40 p-5 sm:p-6 [--card-spacing:0] space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <MousePointerClick className="h-4 w-4" />
                  Kako dodati punkt
                </div>
                <ol className="text-sm text-emerald-900/80 space-y-1 list-decimal list-inside">
                  <li>Pretražite mjesto ili kliknite na mapu</li>
                  <li>Upišite naziv i odaberite vrstu punkta</li>
                  <li>Kliknite "Dodaj punkt"</li>
                </ol>
                <p className="text-xs text-emerald-900/70 pt-1">
                  Za izmjenu ili brisanje kliknite na postojeći marker ili na stavku u listi ispod.
                </p>
              </Card>
            )}

            <Card className="rounded-3xl border-border p-5 sm:p-6 [--card-spacing:0] space-y-4">
              <h3 className="font-bold text-foreground">Punktovi ({checkpoints.length})</h3>

              {checkpoints.length === 0 ? (
                <p className="text-sm text-muted-foreground">Još nema punktova. Dodajte prvi na mapi.</p>
              ) : (
                Object.entries(checkpointsByDay).map(([day, list]) => {
                  const stage = stages.find((s) => s.stage_day === Number(day));
                  return (
                    <div key={day} className="space-y-2">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Dan {day}
                        {stage ? ` · ${stage.name.replace(/^\d+\.\s*etapa:\s*/i, '')}` : ''}
                      </div>
                      <ul className="space-y-1.5">
                        {list.map((cp) => (
                          <li key={cp.cid}>
                            <button
                              type="button"
                              onClick={() => handleSelectCheckpoint(cp)}
                              className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm cursor-pointer transition-colors ${
                                editingId === cp.cid ? 'bg-emerald-100' : 'bg-muted/40 hover:bg-emerald-50'
                              }`}
                            >
                              <span className="text-base leading-none">{CHECKPOINT_VISUAL[cp.type]?.emoji}</span>
                              <span className="font-semibold text-foreground truncate">{cp.name}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};