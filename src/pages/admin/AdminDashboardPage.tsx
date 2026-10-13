import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  getAdminStatistics,
  type AdminStatisticsResponse,
} from '@/api/admin';
import { getApiErrorMessage } from '@/api/errors';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MarsMiraLogo } from '@/components/MarsMiraLogo';
import {
  ShieldAlert,
  Users,
  LogOut,
  Layers,
  ArrowRight,
  MapPinned,
  Globe,
  Building2,
  Activity,
  CheckCircle2,
  Clock,
  Compass,
  RefreshCw,
  Search,
  TrendingUp,
  UserCheck,
  UserMinus,
  Sparkles,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<AdminStatisticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [geoSearch, setGeoSearch] = useState('');

  const fetchStats = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage('');
    try {
      const data = await getAdminStatistics();
      setStats(data);
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, 'Greška pri učitavanju statistike.'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Filtered country and city rows
  const filteredCountryCity = useMemo(() => {
    if (!stats?.by_country_and_city) return [];
    if (!geoSearch.trim()) return stats.by_country_and_city;
    const term = geoSearch.toLowerCase().trim();
    return stats.by_country_and_city.filter(
      (item) =>
        item.country.toLowerCase().includes(term) ||
        item.city.toLowerCase().includes(term)
    );
  }, [stats?.by_country_and_city, geoSearch]);

  const total = stats?.total_participants || 0;
  const domesticCount = stats?.domestic_vs_foreign.domestic || 0;
  const foreignCount = stats?.domestic_vs_foreign.foreign || 0;
  const domesticPct = stats?.domestic_vs_foreign.domestic_percentage || 0;
  const foreignPct = stats?.domestic_vs_foreign.foreign_percentage || 0;

  const registeredCount = stats?.by_status.registered || 0;
  const activeCount = stats?.by_status.active || 0;
  const finishedCount = stats?.by_status.finished || 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-12 space-y-8 lg:space-y-10">
      {/* Welcome Banner Card */}
      <Card className="border-emerald-200/70 bg-gradient-to-br from-emerald-50/90 via-card to-card shadow-md rounded-3xl p-6 sm:p-8 lg:p-10 [--card-spacing:0]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <MarsMiraLogo className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl shadow-sm border border-border/40 shrink-0" />
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge className="bg-emerald-700 hover:bg-emerald-700 text-white gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold shadow-xs">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Administratorski panel</span>
                </Badge>
                <Badge
                  variant="outline"
                  className="border-emerald-200 text-emerald-800 bg-emerald-50/70 rounded-full px-3.5 py-1 text-xs font-medium"
                >
                  {stats?.event?.name || 'Marš Mira 2026'} • Analitika & Koordinacija
                </Badge>
                <Badge
                  variant="outline"
                  className="border-blue-200 text-blue-800 bg-blue-50/70 rounded-full px-3.5 py-1 text-xs font-medium gap-1"
                >
                  <Sparkles className="h-3 w-3 text-blue-600" />
                  <span>SQL Agregati uživo</span>
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
                Dobrodošli, {user?.first_name} {user?.last_name}!
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                Centralni pregled statistike marša: broj prijavljenih učesnika, omjer domaćih i stranih državljana, geografska raspodjela po gradovima, te statusi kretanja po ruti.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchStats(true)}
              disabled={isLoading || isRefreshing}
              className="rounded-full cursor-pointer hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 h-10 px-4 text-xs sm:text-sm font-semibold transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Osvježi</span>
            </Button>
            <Button
              variant="outline"
              onClick={logout}
              className="rounded-full cursor-pointer hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 h-10 px-5 text-sm font-semibold transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Odjava</span>
            </Button>
          </div>
        </div>
      </Card>

      {errorMessage && (
        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 flex items-center justify-between text-sm font-semibold">
          <span>{errorMessage}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchStats(false)}
            className="rounded-full bg-white text-rose-800 border-rose-200"
          >
            Pokušaj ponovo
          </Button>
        </div>
      )}

      {/* KPI METRIC CARDS (4 PRIMARY AGGREGATES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Ukupan broj učesnika */}
        <Card className="rounded-3xl border-border p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 [--card-spacing:0]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Ukupno učesnika
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {isLoading ? '...' : total}
              </div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Users className="h-6 w-6" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Baza učesnika</span>
              <span className="text-emerald-700 font-bold">100% verifikovano</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-emerald-500 h-2 rounded-full w-full" />
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Pregled liste</span>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs font-semibold text-emerald-800 hover:bg-emerald-50 gap-1 px-3">
              <Link to="/admin/participants">
                <span>Učesnici</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </Card>

        {/* KPI 2: Domaći vs Strani (is_domestic) */}
        <Card className="rounded-3xl border-border p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 [--card-spacing:0]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Domaći / Strani (BiH / Svijet)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-700">
                  {isLoading ? '...' : domesticCount}
                </span>
                <span className="text-sm font-semibold text-muted-foreground">
                  / {isLoading ? '...' : foreignCount} strani
                </span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Globe className="h-6 w-6" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-emerald-800">BiH: {domesticPct}%</span>
              <span className="text-blue-800">Svijet: {foreignPct}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-emerald-600 h-2"
                style={{ width: `${domesticPct}%` }}
                title={`Domaći: ${domesticPct}%`}
              />
              <div
                className="bg-blue-500 h-2"
                style={{ width: `${foreignPct}%` }}
                title={`Strani: ${foreignPct}%`}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <Badge variant="outline" className="text-[11px] font-semibold border-emerald-200 text-emerald-800 bg-emerald-50/50">
              {domesticCount > 0 ? `${domesticCount} domaća lica` : 'Nema domaćih'}
            </Badge>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs font-semibold text-emerald-800 hover:bg-emerald-50 gap-1 px-3">
              <Link to="/admin/participants?is_domestic=true">
                <span>Filter</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </Card>

        {/* KPI 3: Broj grupa */}
        <Card className="rounded-3xl border-border p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 [--card-spacing:0]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Broj grupa & Timovi
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                {isLoading ? '...' : (stats?.groups.total_groups || 0)}
              </div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Layers className="h-6 w-6" />
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-muted-foreground font-medium">
              <span>U timovima:</span>
              <span className="font-bold text-foreground">
                {stats?.groups.participants_in_groups || 0} ({stats?.total_participants ? Math.round(((stats.groups.participants_in_groups || 0) / stats.total_participants) * 100) : 0}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground font-medium">
              <span>Samostalni hodnici:</span>
              <span className="font-bold text-foreground">
                {stats?.groups.independent_participants || 0}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              Prosjek: {stats?.groups.avg_group_size || 0} / grupi
            </span>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs font-semibold text-emerald-800 hover:bg-emerald-50 gap-1 px-3">
              <Link to="/admin/groups">
                <span>Grupe</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </Card>

        {/* KPI 4: Broj po statusu */}
        <Card className="rounded-3xl border-border p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 [--card-spacing:0]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Statusi marša
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  {isLoading ? '...' : activeCount}
                </span>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  aktivnih na ruti
                </span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
              <Activity className="h-6 w-6" />
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-500" /> Prijavljeni:
              </span>
              <span className="font-bold text-foreground">{registeredCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" /> Završili:
              </span>
              <span className="font-bold text-foreground">{finishedCount}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Praćenje etape</span>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs font-semibold text-emerald-800 hover:bg-emerald-50 gap-1 px-3">
              <Link to="/admin/live-map">
                <span>Live mapa</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* DETAILED STATISTICAL MODULES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MODULE 1: STATUS DYNAMICS & PARTICIPATION PROGRESS */}
        <Card className="rounded-3xl border-border p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6 [--card-spacing:0]">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-black text-foreground">Status učesnika</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Agregatni SQL raspored: prijavljeni, aktivno na stazi i učesnici koji su stigli na cilj u Potočare.
            </p>
          </div>

          <div className="space-y-4">
            {/* Status 1: Registered */}
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  <span>Prijavljeni (registered)</span>
                </div>
                <div className="font-black text-sm">
                  {registeredCount}{' '}
                  <span className="text-xs font-semibold text-muted-foreground">
                    ({total > 0 ? Math.round((registeredCount / total) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className="bg-slate-400 h-2 rounded-full"
                  style={{ width: `${total > 0 ? (registeredCount / total) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center pt-1 text-[11px] text-muted-foreground">
                <span>Čekaju start pohoda</span>
                <Link
                  to="/admin/participants?status=registered"
                  className="text-emerald-700 font-semibold hover:underline"
                >
                  Filtriraj
                </Link>
              </div>
            </div>

            {/* Status 2: Active */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-950">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Na ruti (active)</span>
                </div>
                <div className="font-black text-sm text-emerald-900">
                  {activeCount}{' '}
                  <span className="text-xs font-semibold text-emerald-700">
                    ({total > 0 ? Math.round((activeCount / total) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-emerald-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all"
                  style={{ width: `${total > 0 ? (activeCount / total) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center pt-1 text-[11px] text-emerald-800">
                <span>Aktivno hodaju na etapi</span>
                <Link
                  to="/admin/participants?status=active"
                  className="text-emerald-800 font-bold hover:underline"
                >
                  Filtriraj
                </Link>
              </div>
            </div>

            {/* Status 3: Finished */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Stigli na cilj (finished)</span>
                </div>
                <div className="font-black text-sm text-amber-900">
                  {finishedCount}{' '}
                  <span className="text-xs font-semibold text-amber-700">
                    ({total > 0 ? Math.round((finishedCount / total) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-600 h-2 rounded-full transition-all"
                  style={{ width: `${total > 0 ? (finishedCount / total) * 100 : 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center pt-1 text-[11px] text-amber-800">
                <span>Uspješno okončan marš</span>
                <Link
                  to="/admin/participants?status=finished"
                  className="text-amber-800 font-bold hover:underline"
                >
                  Filtriraj
                </Link>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-xs text-muted-foreground flex items-center justify-between">
            <span className="font-medium">Ukupno zabilježenih učešća:</span>
            <span className="font-black text-foreground">{total}</span>
          </div>
        </Card>

        {/* MODULE 2: GEOGRAPHY — COUNTRIES & CITIES BREAKDOWN */}
        <Card className="rounded-3xl border-border p-6 sm:p-8 shadow-xs lg:col-span-2 space-y-6 [--card-spacing:0]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-blue-100/70 text-blue-800 flex items-center justify-center">
                  <Globe className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-black text-foreground">
                  Geografska raspodjela (Države & Gradovi)
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Grupisano po državi i gradu prema podacima iz baze učesnika.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Traži državu ili grad..."
                value={geoSearch}
                onChange={(e) => setGeoSearch(e.target.value)}
                className="rounded-full pl-9 h-9 text-xs bg-background"
              />
            </div>
          </div>

          <Tabs defaultValue="grouped" className="w-full space-y-5">
            <TabsList className="grid w-full grid-cols-3 rounded-full p-1 bg-muted/80 border border-border/50">
              <TabsTrigger value="grouped" className="rounded-full text-xs font-bold cursor-pointer">
                Država & Grad ({filteredCountryCity.length})
              </TabsTrigger>
              <TabsTrigger value="countries" className="rounded-full text-xs font-bold cursor-pointer">
                Države ({stats?.by_country?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="cities" className="rounded-full text-xs font-bold cursor-pointer">
                Vodeći gradovi ({stats?.by_city?.length || 0})
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: GRUPISANO PO DRŽAVI I GRADU */}
            <TabsContent value="grouped" className="mt-0">
              <div className="rounded-2xl border border-border/70 overflow-hidden">
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-muted/90 backdrop-blur-xs border-b border-border text-muted-foreground uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-4 py-3">Država</th>
                        <th className="px-4 py-3">Grad</th>
                        <th className="px-4 py-3">Status porijekla</th>
                        <th className="px-4 py-3 text-right">Učesnici</th>
                        <th className="px-4 py-3 text-right">Udio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {filteredCountryCity.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                            Nema podataka koji odgovaraju pretrazi.
                          </td>
                        </tr>
                      ) : (
                        filteredCountryCity.map((item, idx) => (
                          <tr key={`${item.country}-${item.city}-${idx}`} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-semibold text-foreground flex items-center gap-2">
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{item.country}</span>
                            </td>
                            <td className="px-4 py-3 font-medium text-foreground">
                              {item.city}
                            </td>
                            <td className="px-4 py-3">
                              {item.is_domestic ? (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold text-[10px] rounded-full px-2 py-0.5">
                                  Domaći (BiH)
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-semibold text-[10px] rounded-full px-2 py-0.5">
                                  Strani državljanin
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right font-black text-sm text-foreground">
                              {item.count}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-muted-foreground">
                              {item.percentage}%
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: PO DRŽAVAMA */}
            <TabsContent value="countries" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(stats?.by_country || []).map((c, idx) => (
                  <div
                    key={`${c.country}-${idx}`}
                    className="p-4 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">{c.country}</span>
                        {c.is_domestic ? (
                          <Badge className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded-full px-2 py-0">
                            BiH
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 text-[10px] font-semibold rounded-full px-2 py-0">
                            Strani
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{c.percentage}% od ukupnog broja</span>
                    </div>
                    <div className="text-xl font-extrabold text-foreground">{c.count}</div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* TAB 3: PO GRADOVIMA */}
            <TabsContent value="cities" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(stats?.by_city || []).map((cityItem, idx) => (
                  <div
                    key={`${cityItem.city}-${cityItem.country}-${idx}`}
                    className="p-4 rounded-2xl bg-muted/40 border border-border/70 flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-foreground">{cityItem.city}</div>
                      <div className="text-xs text-muted-foreground">{cityItem.country}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-extrabold text-foreground">{cityItem.count}</div>
                      <div className="text-[11px] text-muted-foreground">{cityItem.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="pt-2 border-t border-border/60 flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-3">
            <span className="font-medium">
              Podaci se automatski agregiraju iz tabele učesnika.
            </span>
            <Button asChild variant="outline" size="sm" className="rounded-full text-xs font-semibold h-8 px-4">
              <Link to="/admin/participants">
                Otvori detaljnu tabelu sa svim kolonama
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>
        </Card>
      </div>

      {/* MODULE 3: TEAMS & GROUPS OVERVIEW + QUICK SHORTCUTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* GROUP STRUCTURE DETAILS */}
        <Card className="rounded-3xl border-border p-6 sm:p-8 shadow-xs lg:col-span-2 space-y-6 [--card-spacing:0]">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center">
                  <Layers className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-black text-foreground">Struktura grupa i timova</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Pregled formiranih timova sa pristupnim kodovima (`join_code`) i rasporedom članova.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs font-semibold text-emerald-800 hover:bg-emerald-50">
              <Link to="/admin/groups">
                <span>Sve grupe</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
              <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Učesnici u grupama</span>
              </div>
              <div className="text-2xl font-black text-foreground">
                {stats?.groups.participants_in_groups || 0}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Organizovani u timove
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
              <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                <UserMinus className="h-3.5 w-3.5 text-slate-500" />
                <span>Samostalni učesnici</span>
              </div>
              <div className="text-2xl font-black text-foreground">
                {stats?.groups.independent_participants || 0}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Hodaju individualno
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
              <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-blue-600" />
                <span>Najveća formirana grupa</span>
              </div>
              <div className="text-base font-extrabold text-foreground truncate" title={stats?.groups.largest_group?.name || 'Nema grupa'}>
                {stats?.groups.largest_group ? stats.groups.largest_group.name : 'Nema grupa'}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {stats?.groups.largest_group ? `${stats.groups.largest_group.member_count} članova` : '0 članova'}
              </div>
            </div>
          </div>

          {/* Top Groups Table */}
          <div className="rounded-2xl border border-border/70 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/90 border-b border-border text-muted-foreground uppercase font-bold">
                <tr>
                  <th className="px-4 py-3">Naziv grupe</th>
                  <th className="px-4 py-3">Kod za pristup</th>
                  <th className="px-4 py-3 text-right">Broj članova</th>
                  <th className="px-4 py-3 text-right">Akcija</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {(stats?.groups.top_groups || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                      Nema registrovanih grupa.
                    </td>
                  </tr>
                ) : (
                  (stats?.groups.top_groups || []).map((grp) => (
                    <tr key={grp.gid} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-bold text-foreground">
                        {grp.name}
                      </td>
                      <td className="px-4 py-3">
                        <code className="px-2 py-0.5 rounded-md bg-muted font-mono text-[11px] font-bold text-emerald-800 border border-border">
                          {grp.join_code}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-right font-black text-sm text-foreground">
                        {grp.member_count}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button asChild variant="ghost" size="sm" className="h-7 text-xs rounded-full">
                          <Link to="/admin/groups">Pregled</Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* QUICK ADMIN ACTIONS PANEL */}
        <Card className="rounded-3xl border-border p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6 [--card-spacing:0]">
          <div className="space-y-2">
            <h3 className="text-lg font-black text-foreground">Brze akcije administratora</h3>
            <p className="text-xs text-muted-foreground">
              Direktan pristup ključnim modulima za operativno vođenje Marša Mira.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              asChild
              variant="outline"
              className="w-full justify-between rounded-2xl h-14 px-4 hover:border-emerald-300 hover:bg-emerald-50/70 text-foreground transition-all"
            >
              <Link to="/admin/participants">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Pregled učesnika</div>
                    <div className="text-[11px] text-muted-foreground">{total} registrovanih</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full justify-between rounded-2xl h-14 px-4 hover:border-emerald-300 hover:bg-emerald-50/70 text-foreground transition-all"
            >
              <Link to="/admin/groups">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Upravljanje grupama</div>
                    <div className="text-[11px] text-muted-foreground">{stats?.groups.total_groups || 0} formiranih</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full justify-between rounded-2xl h-14 px-4 hover:border-emerald-300 hover:bg-emerald-50/70 text-foreground transition-all"
            >
              <Link to="/admin/live-map">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Live mapa svih aktivnih</div>
                    <div className="text-[11px] text-muted-foreground">{activeCount} na stazi uživo</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full justify-between rounded-2xl h-14 px-4 hover:border-emerald-300 hover:bg-emerald-50/70 text-foreground transition-all"
            >
              <Link to="/admin/route">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                    <MapPinned className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold">Uređivanje punktova rute</div>
                    <div className="text-[11px] text-muted-foreground">Interaktivna Leaflet mapa</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Sistem spreman</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Svi agregatni SQL upiti se izvršavaju direktno nad PostgreSQL bazom uz indeksirano pretraživanje.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};