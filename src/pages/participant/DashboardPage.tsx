import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { MarsMiraLogo } from '@/components/MarsMiraLogo';
import { Users, MapPin, Route, ShieldCheck, UserCheck, Plus, KeyRound, LogOut } from 'lucide-react';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [teamCode, setTeamCode] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleJoinSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!teamCode.trim()) return;
    setActionNotice(`Unesen kod "${teamCode.trim().toUpperCase()}". Funkcionalnost pridruživanja timu stiže na narednom sprintu!`);
    setShowJoinModal(false);
    setTeamCode('');
  };

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setActionNotice(`Tim "${newTeamName.trim()}" će biti aktiviran u narednom koraku.`);
    setShowCreateModal(false);
    setNewTeamName('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-12 space-y-8 lg:space-y-10">
      {/* Welcome Banner Card */}
      <Card className="border-emerald-200/60 bg-linear-to-br from-emerald-50/80 via-card to-card shadow-md rounded-3xl p-6 sm:p-8 lg:p-10 [--card-spacing:0]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <MarsMiraLogo className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl shadow-sm border border-border/40 shrink-0" />
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white gap-1.5 rounded-full px-3.5 py-1 text-xs font-semibold shadow-xs">
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Učesnički profil</span>
                </Badge>
                <Badge variant="outline" className="border-emerald-200 text-emerald-800 bg-emerald-50/70 rounded-full px-3.5 py-1 text-xs font-medium">
                  Marš Mira 2026
                </Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
                Dobrodošli, {user?.first_name} {user?.last_name}!
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                Vaš nalog je uspješno kreiran. Ovdje možete upravljati svojim timom, pregledati lične podatke i pratiti trasu marša.
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
              <span>Odjava sa profila</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Action Banner / Notification */}
      {actionNotice && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 sm:p-5 text-sm font-semibold text-emerald-900 shadow-xs animate-in fade-in-50">
          <span>ℹ️ {actionNotice}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActionNotice(null)}
            className="h-8 w-8 p-0 text-emerald-800 hover:bg-emerald-100 rounded-full cursor-pointer"
          >
            ✕
          </Button>
        </div>
      )}

      {/* Grid: 3 Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Card 1: Team & Group */}
        <Card className="flex flex-col justify-between shadow-sm border-border hover:shadow-md transition-shadow rounded-3xl p-6 sm:p-8 [--card-spacing:0] space-y-6">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Grupa i Tim</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                Učestvujete li sa prijateljima ili organizacijom? Pridružite se grupi pomoću koda ili osnujte novi tim kao vođa.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={() => setShowJoinModal(true)}
              className="flex-1 h-11 rounded-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shadow-sm shadow-emerald-600/20"
            >
              <KeyRound className="h-4 w-4" />
              <span>Pridruži se</span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(true)}
              className="flex-1 h-11 rounded-full cursor-pointer bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 gap-2 font-semibold"
            >
              <Plus className="h-4 w-4" />
              <span>Kreiraj tim</span>
            </Button>
          </div>
        </Card>

        {/* Card 2: Profile Details */}
        <Card className="flex flex-col justify-between shadow-sm border-border hover:shadow-md transition-shadow rounded-3xl p-6 sm:p-8 [--card-spacing:0] space-y-6">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Podaci o učesniku</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                Pregled vaših ličnih informacija registrovanih u bazi:
              </p>
            </div>

            <div className="space-y-3.5 pt-2 text-sm">
              <div className="flex justify-between items-center py-2.5 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Email:</span>
                <span className="font-semibold text-foreground text-right truncate max-w-[200px]" title={user?.email}>
                  {user?.email}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Prebivalište:</span>
                <span className="font-semibold text-foreground">{user?.city}, {user?.country}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Uloga:</span>
                <Badge variant="outline" className="font-semibold capitalize text-emerald-800 bg-emerald-50/60 border-emerald-200 px-3 py-0.5">
                  {user?.role}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span className="text-muted-foreground font-medium">Status naloga:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                  Aktivan <span className="text-xs">✓</span>
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Podaci se koriste za sigurnosne i logističke spiskove.</span>
          </div>
        </Card>

        {/* Card 3: Route Overview */}
        <Card className="flex flex-col justify-between shadow-sm border-border hover:shadow-md transition-shadow rounded-3xl p-6 sm:p-8 [--card-spacing:0] space-y-6">
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
              <Route className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Ruta Marša Mira</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                Zvanična trasa duga ~100 kilometara podijeljena u tri jednodnevne etape:
              </p>
            </div>

            <div className="space-y-3 pt-2 text-sm">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 hover:bg-emerald-50/60 transition-colors">
                <span className="font-medium text-foreground">1. dan: <strong className="font-semibold">Nezuk → Liplje</strong></span>
                <Badge variant="secondary" className="font-semibold text-xs text-emerald-800 bg-emerald-50 border-emerald-200 px-2.5 py-0.5 rounded-full">
                  ~35 km
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 hover:bg-emerald-50/60 transition-colors">
                <span className="font-medium text-foreground">2. dan: <strong className="font-semibold">Liplje → Mravinjci</strong></span>
                <Badge variant="secondary" className="font-semibold text-xs text-emerald-800 bg-emerald-50 border-emerald-200 px-2.5 py-0.5 rounded-full">
                  ~35 km
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 hover:bg-emerald-50/60 transition-colors">
                <span className="font-medium text-foreground">3. dan: <strong className="font-semibold">Mravinjci → Potočari</strong></span>
                <Badge variant="secondary" className="font-semibold text-xs text-emerald-800 bg-emerald-50 border-emerald-200 px-2.5 py-0.5 rounded-full">
                  ~30 km
                </Badge>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border/50 text-xs text-muted-foreground flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
            <span>Cilj marša je Memorijalni centar Potočari 10. jula.</span>
          </div>
        </Card>
      </div>

      {/* Shadcn Dialog: Join Team Modal */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="sm:max-w-md p-6 sm:p-8 rounded-3xl space-y-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl sm:text-2xl font-black">Pridruži se timu</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Unesite 6-cifreni pristupni kod koji vam je dodijelio vođa vašeg tima:
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleJoinSubmit} className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="team-code" className="text-sm font-semibold text-foreground/90 block">Kod grupe</Label>
              <Input
                id="team-code"
                type="text"
                required
                placeholder="npr. MM-8492"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                className="h-12 rounded-xl text-center text-lg font-bold tracking-widest uppercase border-border/80 focus-visible:ring-emerald-500/30"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowJoinModal(false)}
                className="rounded-full cursor-pointer h-11 px-5"
              >
                Odustani
              </Button>
              <Button
                type="submit"
                className="rounded-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6 shadow-md shadow-emerald-600/25"
              >
                Potvrdi i pridruži se
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Shadcn Dialog: Create Team Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md p-6 sm:p-8 rounded-3xl space-y-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl sm:text-2xl font-black">Kreiraj novu grupu</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Unesite naziv grupe. Kao vođa, dobit ćete jedinstveni kod za poziv ostalih učesnika:
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="team-name" className="text-sm font-semibold text-foreground/90 block">Naziv grupe</Label>
              <Input
                id="team-name"
                type="text"
                required
                placeholder="npr. Tuzlanski planinari"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="h-12 rounded-xl px-4 text-base border-border/80 focus-visible:ring-emerald-500/30"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="rounded-full cursor-pointer h-11 px-5"
              >
                Odustani
              </Button>
              <Button
                type="submit"
                className="rounded-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6 shadow-md shadow-emerald-600/25"
              >
                Kreiraj tim
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
