import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
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
import { Users, MapPin, Route, ShieldCheck, UserCheck, Plus, KeyRound } from 'lucide-react';

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Banner Card */}
      <Card className="border-emerald-200/60 bg-linear-to-br from-emerald-50/80 via-card to-card shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white gap-1 rounded-full px-3 py-0.5 text-xs font-semibold">
                <UserCheck className="h-3.5 w-3.5" />
                <span>Učesnički profil</span>
              </Badge>
              <Badge variant="outline" className="border-emerald-200 text-emerald-800 bg-emerald-50/50 rounded-full px-3 py-0.5 text-xs">
                Marš Mira 2026
              </Badge>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Dobrodošli, {user?.first_name} {user?.last_name}!
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-muted-foreground">
              Vaš nalog je uspješno kreiran. Ovdje možete upravljati svojim timom i pratiti detalje o maršu.
            </CardDescription>
          </div>

          <Button
            variant="outline"
            onClick={logout}
            className="self-start sm:self-auto rounded-full cursor-pointer hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
          >
            Odjava sa profila
          </Button>
        </CardHeader>
      </Card>

      {/* Action Banner / Notification */}
      {actionNotice && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50/90 p-4 text-sm font-semibold text-emerald-900 shadow-xs animate-in fade-in-50">
          <span>ℹ️ {actionNotice}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActionNotice(null)}
            className="h-8 w-8 p-0 text-emerald-800 hover:bg-emerald-100/50 rounded-full cursor-pointer"
          >
            ✕
          </Button>
        </div>
      )}

      {/* Grid: 3 Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Team & Group */}
        <Card className="flex flex-col justify-between shadow-sm border-border hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <Users className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Grupa i Tim</CardTitle>
            <CardDescription className="text-sm text-muted-foreground leading-relaxed">
              Učestvujete li sa prijateljima ili organizacijom? Pridružite se grupi pomoću koda ili osnujte novi tim kao vođa.
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-wrap gap-2 pt-2">
            <Button
              onClick={() => setShowJoinModal(true)}
              className="flex-1 rounded-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 shadow-sm shadow-emerald-600/20"
            >
              <KeyRound className="h-4 w-4" />
              <span>Pridruži se</span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(true)}
              className="flex-1 rounded-full cursor-pointer bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 gap-1.5 font-bold"
            >
              <Plus className="h-4 w-4" />
              <span>Kreiraj tim</span>
            </Button>
          </CardFooter>
        </Card>

        {/* Card 2: Profile Details */}
        <Card className="flex flex-col justify-between shadow-sm border-border hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Podaci o učesniku</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Pregled vaših ličnih informacija registrovanih u bazi:
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-1 border-b border-border/60">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-semibold text-foreground">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/60">
              <span className="text-muted-foreground">Prebivalište:</span>
              <span className="font-semibold text-foreground">{user?.city}, {user?.country}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border/60">
              <span className="text-muted-foreground">Uloga:</span>
              <Badge variant="outline" className="font-semibold capitalize text-emerald-800 bg-emerald-50/60 border-emerald-200">
                {user?.role}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Status naloga:</span>
              <span className="font-bold text-emerald-600">Aktivan ✓</span>
            </div>
          </CardContent>

          <CardFooter>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              <span>Podaci se koriste za sigurnosne i logističke spiskove.</span>
            </div>
          </CardFooter>
        </Card>

        {/* Card 3: Route Overview */}
        <Card className="flex flex-col justify-between shadow-sm border-border hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <Route className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold">Ruta Marša Mira</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Zvanična trasa duga ~100 kilometara podijeljena u tri jednodnevne etape:
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted text-xs sm:text-sm">
              <span className="font-medium">1. dan: <strong>Nezuk → Liplje</strong></span>
              <Badge variant="secondary" className="font-mono text-xs">~35 km</Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted text-xs sm:text-sm">
              <span className="font-medium">2. dan: <strong>Liplje → Mravinjci</strong></span>
              <Badge variant="secondary" className="font-mono text-xs">~35 km</Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted text-xs sm:text-sm">
              <span className="font-medium">3. dan: <strong>Mravinjci → Potočari</strong></span>
              <Badge variant="secondary" className="font-mono text-xs">~30 km</Badge>
            </div>
          </CardContent>

          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Cilj marša je Memorijalni centar Potočari 10. jula.
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Shadcn Dialog: Join Team Modal */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Pridruži se postojećem timu</DialogTitle>
            <DialogDescription>
              Unesite 6-cifreni kod koji vam je poslao vođa grupe:
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleJoinSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="team-code">Kod grupe</Label>
              <Input
                id="team-code"
                type="text"
                required
                placeholder="npr. MM-8492"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                className="h-12 rounded-full text-center text-lg font-bold tracking-widest uppercase"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowJoinModal(false)}
                className="rounded-full cursor-pointer"
              >
                Odustani
              </Button>
              <Button
                type="submit"
                className="rounded-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Potvrdi i pridruži se
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Shadcn Dialog: Create Team Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Kreiraj novu grupu</DialogTitle>
            <DialogDescription>
              Unesite naziv grupe. Kao vođa, dobit ćete jedinstveni kod za poziv ostalih učesnika:
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="team-name">Naziv grupe</Label>
              <Input
                id="team-name"
                type="text"
                required
                placeholder="npr. Tuzlanski planinari"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="h-11 rounded-full px-4"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="rounded-full cursor-pointer"
              >
                Odustani
              </Button>
              <Button
                type="submit"
                className="rounded-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
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
