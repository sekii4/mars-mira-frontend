import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarsMiraLogo } from '@/components/MarsMiraLogo';
import {
  ShieldAlert,
  Users,
  Calendar,
  LogOut,
  CheckCircle2,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-12 space-y-8 lg:space-y-10">
      {/* Welcome Banner Card */}
      <Card className="border-emerald-200/70 bg-linear-to-br from-emerald-50/90 via-card to-card shadow-md rounded-3xl p-6 sm:p-8 lg:p-10 [--card-spacing:0]">
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
                  Marš Mira 2026 • Glavna koordinacija
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
                Dobrodošli, {user?.first_name} {user?.last_name}!
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                Prijavljeni ste sa administratorskim ovlastima. Ovdje možete pratiti učesnike, organizovati grupe, upravljati etapama i nadzirati sistem.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
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

      {/* Admin Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <Card className="flex flex-col justify-between shadow-sm border-border hover:shadow-md transition-shadow rounded-3xl p-6 sm:p-8 [--card-spacing:0] space-y-6">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Učesnici
              </div>
              <h3 className="text-2xl font-black text-foreground mt-1">Registrovani učesnici</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                Upravljanje prijavljenim građanima, verifikacija profila i generisanje akreditacija.
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Baza aktivna
            </span>
            <Button variant="ghost" size="sm" className="rounded-full gap-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50">
              <span>Pregled</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col justify-between shadow-sm border-border hover:shadow-md transition-shadow rounded-3xl p-6 sm:p-8 [--card-spacing:0] space-y-6">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Timovi & Grupe
              </div>
              <h3 className="text-2xl font-black text-foreground mt-1">Struktura grupa</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                Nadzor kreiranih grupa, kodova za pristup (`join_code`) i raspored vođa timova na stazi.
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Sistem kodova aktivan
            </span>
            <Button variant="ghost" size="sm" className="rounded-full gap-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50">
              <span>Upravljanje</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col justify-between shadow-sm border-border hover:shadow-md transition-shadow rounded-3xl p-6 sm:p-8 [--card-spacing:0] space-y-6">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Događaj
              </div>
              <h3 className="text-2xl font-black text-foreground mt-1">Marš Mira 2026</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                8. jul – 10. jul 2026. (Nezuk – Liplje – Mravinjci – Potočari).
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-border/60 flex items-center justify-between">
            <Badge variant="outline" className="border-emerald-200 text-emerald-800 bg-emerald-50/70 rounded-full px-3 py-0.5 text-xs font-medium">
              Aktuelni događaj
            </Badge>
            <Button variant="ghost" size="sm" className="rounded-full gap-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50">
              <span>Postavke</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Admin Quick Control Panel */}
      <Card className="shadow-sm border-border rounded-3xl p-6 sm:p-8 [--card-spacing:0] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
          <div>
            <h3 className="text-xl font-bold text-foreground">Sistemske informacije & Akcije</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Brze administratorske funkcije za pripremu i koordinaciju marša.
            </p>
          </div>
          <Badge className="bg-emerald-600/10 text-emerald-800 border-emerald-200/80 px-3.5 py-1 rounded-full text-xs font-semibold self-start sm:self-center">
            Povezano: PostgreSQL + JWT Auth
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
            <div className="text-xs font-medium text-muted-foreground">Admin Nalog</div>
            <div className="font-semibold text-foreground text-sm truncate" title={user?.email}>
              {user?.email}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
            <div className="text-xs font-medium text-muted-foreground">Nivo pristupa</div>
            <div className="font-bold text-emerald-700 text-sm capitalize">
              {user?.role} (Potpuni pristup)
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
            <div className="text-xs font-medium text-muted-foreground">Sigurnost sesije</div>
            <div className="font-semibold text-foreground text-sm">
              JWT Bearer (7 dana)
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
            <div className="text-xs font-medium text-muted-foreground">Status API servisa</div>
            <div className="font-bold text-emerald-700 text-sm flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Operativan
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
