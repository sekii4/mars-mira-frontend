import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  listParticipants,
  getParticipantDetail,
  listGroups,
  type AdminParticipant,
  type AdminParticipantDetail,
  type AdminGroup,
} from '@/api/admin';
import type { MarchStatus } from '@/api/participation';
import { getApiErrorMessage } from '@/api/errors';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ArrowLeft, Search, Loader2, AlertCircle, Users, X } from 'lucide-react';

const STATUS_LABEL: Record<MarchStatus, string> = {
  registered: 'Registrovan',
  active: 'Aktivan',
  finished: 'Završio',
};

const StatusBadge = ({ status }: { status: MarchStatus }) => (
  <Badge
    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      status === 'active'
        ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
        : status === 'finished'
        ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-100'
        : 'bg-muted text-muted-foreground border-border'
    }`}
    variant={status === 'registered' ? 'outline' : 'default'}
  >
    {STATUS_LABEL[status]}
  </Badge>
);

// Debounce pomoćna funkcija - čeka da korisnik prestane kucati prije novog zahtjeva
const useDebouncedValue = <T,>(value: T, delayMs: number): T => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
};

export const ParticipantsPage = () => {
  const [participants, setParticipants] = useState<AdminParticipant[]>([]);
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [countryInput, setCountryInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState<MarchStatus | ''>('');
  const [groupFilter, setGroupFilter] = useState<string>('');

  const country = useDebouncedValue(countryInput, 400);
  const city = useDebouncedValue(cityInput, 400);
  const search = useDebouncedValue(searchInput, 400);

  const [selectedUid, setSelectedUid] = useState<number | null>(null);
  const [detail, setDetail] = useState<AdminParticipantDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Lista grupa - samo za padajući filter, učitava se jednom
  useEffect(() => {
    listGroups()
      .then((res) => setGroups(res.groups))
      .catch(() => {
        // Filter po grupi jednostavno ostaje prazan ako ovo ne uspije
      });
  }, []);

  useEffect(() => {
    const fetchParticipants = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const res = await listParticipants({
          country: country || undefined,
          city: city || undefined,
          search: search || undefined,
          status: statusFilter || undefined,
          group_id: groupFilter ? Number(groupFilter) : undefined,
        });
        setParticipants(res.participants);
      } catch (err: unknown) {
        setErrorMessage(getApiErrorMessage(err, 'Nije moguće učitati listu učesnika.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, [country, city, search, statusFilter, groupFilter]);

  useEffect(() => {
    if (selectedUid === null) {
      return;
    }

    getParticipantDetail(selectedUid)
      .then((res) => setDetail(res.participant))
      .catch(() => setDetail(null))
      .finally(() => setIsDetailLoading(false));
  }, [selectedUid]);

  const handleRowClick = (uid: number) => {
    setDetail(null);
    setIsDetailLoading(true);
    setSelectedUid(uid);
  };

  const hasActiveFilters = countryInput || cityInput || searchInput || statusFilter || groupFilter;

  const clearFilters = () => {
    setCountryInput('');
    setCityInput('');
    setSearchInput('');
    setStatusFilter('');
    setGroupFilter('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-12 space-y-6">
      <Button asChild variant="ghost" className="rounded-full gap-2 -ml-3 font-semibold">
        <Link to="/admin">
          <ArrowLeft className="h-4 w-4" />
          <span>Nazad na admin panel</span>
        </Link>
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Učesnici</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isLoading ? 'Učitavanje...' : `${participants.length} ${participants.length === 1 ? 'učesnik' : 'učesnika'} prikazano`}
          </p>
        </div>
      </div>

      {/* Filteri */}
      <Card className="rounded-3xl border-border p-5 sm:p-6 [--card-spacing:0] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pretraga po imenu ili emailu..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-10 rounded-xl pl-10"
            />
          </div>
          <Input
            placeholder="Država"
            value={countryInput}
            onChange={(e) => setCountryInput(e.target.value)}
            className="h-10 rounded-xl"
          />
          <Input
            placeholder="Grad"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            className="h-10 rounded-xl"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as MarchStatus | '')}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="">Svi statusi</option>
            <option value="registered">Registrovan</option>
            <option value="active">Aktivan</option>
            <option value="finished">Završio</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm max-w-xs"
          >
            <option value="">Sve grupe</option>
            {groups.map((g) => (
              <option key={g.gid} value={g.gid}>
                {g.name} ({g.member_count})
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="rounded-full cursor-pointer gap-1.5 text-xs font-semibold text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
              <span>Očisti filtere</span>
            </Button>
          )}
        </div>
      </Card>

      {errorMessage && (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabela */}
      <Card className="rounded-3xl border-border overflow-hidden [--card-spacing:0]">
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <span className="font-semibold text-sm">Učitavanje učesnika...</span>
          </div>
        ) : participants.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
            <Users className="h-8 w-8" />
            <span className="font-semibold text-sm">Nema učesnika za zadate filtere.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="px-5 py-3.5">Ime i prezime</th>
                  <th className="px-5 py-3.5 hidden md:table-cell">Email</th>
                  <th className="px-5 py-3.5">Država / Grad</th>
                  <th className="px-5 py-3.5 hidden sm:table-cell">Grupa</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr
                    key={p.uid}
                    onClick={() => handleRowClick(p.uid)}
                    className="border-b border-border/40 last:border-0 cursor-pointer hover:bg-emerald-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-semibold text-foreground whitespace-nowrap">
                      {p.first_name} {p.last_name}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell truncate max-w-50">
                      {p.email}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                      {p.city}, {p.country}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground hidden sm:table-cell">
                      {p.group_name || <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detalj učesnika */}
      <Dialog
        open={selectedUid !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedUid(null);
            setDetail(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md p-6 sm:p-8 rounded-3xl space-y-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-black">Detalji učesnika</DialogTitle>
            <DialogDescription>Pregled profila i statusa učešća.</DialogDescription>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : detail ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/60">
                <span className="font-bold text-foreground text-base">
                  {detail.first_name} {detail.last_name}
                </span>
                <StatusBadge status={detail.status} />
              </div>
              {[
                ['Email', detail.email],
                ['Država', detail.country],
                ['Grad', detail.city],
                ['Grupa', detail.group_name || '—'],
                ['Kod grupe', detail.join_code || '—'],
                ['Jezik', detail.language],
                ['Registrovan', new Date(detail.created_at).toLocaleDateString('bs-BA')],
                ['Start', detail.start_at ? new Date(detail.start_at).toLocaleString('bs-BA') : '—'],
                ['Finish', detail.finish_at ? new Date(detail.finish_at).toLocaleString('bs-BA') : '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-1.5 border-b border-border/30 last:border-0">
                  <span className="text-muted-foreground font-medium">{label}</span>
                  <span className="font-semibold text-foreground text-right">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-rose-700 font-semibold py-4">
              Nije moguće učitati detalje učesnika.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};