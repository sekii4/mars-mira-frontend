import { useEffect, useState, type FormEvent } from 'react';
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
import { getMyGroup, createGroup, joinGroup, type Group } from '@/api/groups';
import { getApiErrorMessage } from '@/api/errors';
import { Users, KeyRound, Plus, Copy, Check, Loader2, AlertCircle } from 'lucide-react';

export const GroupCard = () => {
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [copied, setCopied] = useState(false);

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamCode, setTeamCode] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyGroup();
        setGroup(res.group);
      } catch (err: unknown) {
        setLoadError(getApiErrorMessage(err, 'Nije moguće učitati podatke o grupi.'));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const openJoinModal = () => {
    setModalError('');
    setTeamCode('');
    setShowJoinModal(true);
  };

  const openCreateModal = () => {
    setModalError('');
    setNewTeamName('');
    setShowCreateModal(true);
  };

  const handleJoinSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!teamCode.trim()) return;

    setModalError('');
    setIsSubmitting(true);
    try {
      const res = await joinGroup(teamCode.trim());
      setGroup(res.group);
      setShowJoinModal(false);
    } catch (err: unknown) {
      setModalError(getApiErrorMessage(err, 'Pridruživanje nije uspjelo. Pokušajte ponovo.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    setModalError('');
    setIsSubmitting(true);
    try {
      const res = await createGroup(newTeamName.trim());
      setGroup(res.group);
      setShowCreateModal(false);
    } catch (err: unknown) {
      setModalError(getApiErrorMessage(err, 'Kreiranje grupe nije uspjelo. Pokušajte ponovo.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!group) return;
    try {
      await navigator.clipboard.writeText(group.join_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard nije dostupan; kod je i dalje vidljiv na ekranu
    }
  };

  return (
    <>
      <Card className="flex flex-col justify-between shadow-sm border-border hover:shadow-md transition-shadow rounded-3xl p-6 sm:p-8 [--card-spacing:0] space-y-6">
        <div className="space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
            <Users className="h-6 w-6" />
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Učitavanje...</span>
            </div>
          ) : loadError ? (
            <div className="flex items-start gap-2 text-sm font-semibold text-rose-700">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{loadError}</span>
            </div>
          ) : group ? (
            <div className="space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-bold text-foreground">{group.name}</h3>
                  {group.is_owner && (
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white rounded-full px-3 py-0.5 text-xs font-semibold">
                      Vođa grupe
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                  Podijelite kod da se ostali učesnici mogu pridružiti vašoj grupi.
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3">
                <div>
                  <div className="text-xs font-semibold text-emerald-800/80 uppercase tracking-wide">Kod grupe</div>
                  <div className="text-2xl font-black tracking-widest text-emerald-900">{group.join_code}</div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="rounded-full cursor-pointer gap-2 border-emerald-200 h-9 px-4 font-semibold"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Kopirano' : 'Kopiraj'}</span>
                </Button>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-semibold text-foreground">Članovi ({group.members.length})</div>
                <ul className="space-y-1.5 text-sm">
                  {group.members.map((member) => (
                    <li
                      key={member.uid}
                      className="flex items-center gap-2.5 rounded-xl bg-muted/50 px-3 py-2 font-medium text-foreground"
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>
                        {member.first_name} {member.last_name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-foreground">Grupa i Tim</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                Učestvujete li sa prijateljima ili organizacijom? Pridružite se grupi pomoću koda ili osnujte novi tim kao vođa.
              </p>
            </div>
          )}
        </div>

        {!isLoading && !loadError && !group && (
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={openJoinModal}
              className="flex-1 h-11 rounded-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shadow-sm shadow-emerald-600/20"
            >
              <KeyRound className="h-4 w-4" />
              <span>Pridruži se</span>
            </Button>
            <Button
              variant="secondary"
              onClick={openCreateModal}
              className="flex-1 h-11 rounded-full cursor-pointer bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 gap-2 font-semibold"
            >
              <Plus className="h-4 w-4" />
              <span>Kreiraj tim</span>
            </Button>
          </div>
        )}
      </Card>

      {/* Modal: pridruživanje grupi */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="sm:max-w-md p-6 sm:p-8 rounded-3xl space-y-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl sm:text-2xl font-black">Pridruži se timu</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Unesite 6-znakovni kod koji vam je dao vođa vašeg tima:
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleJoinSubmit} className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="team-code" className="text-sm font-semibold text-foreground/90 block">
                Kod grupe
              </Label>
              <Input
                id="team-code"
                type="text"
                required
                maxLength={10}
                placeholder="npr. K7M4PX"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                className="h-12 rounded-xl text-center text-lg font-bold tracking-widest uppercase border-border/80 focus-visible:ring-emerald-500/30"
              />
            </div>

            {modalError && (
              <div className="flex items-start gap-2 text-sm font-semibold text-rose-700">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

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
                disabled={isSubmitting}
                className="rounded-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6 shadow-md shadow-emerald-600/25 gap-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Potvrdi i pridruži se</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: kreiranje grupe */}
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
              <Label htmlFor="team-name" className="text-sm font-semibold text-foreground/90 block">
                Naziv grupe
              </Label>
              <Input
                id="team-name"
                type="text"
                required
                maxLength={100}
                placeholder="npr. Tuzlanski planinari"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="h-12 rounded-xl px-4 text-base border-border/80 focus-visible:ring-emerald-500/30"
              />
            </div>

            {modalError && (
              <div className="flex items-start gap-2 text-sm font-semibold text-rose-700">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

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
                disabled={isSubmitting}
                className="rounded-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6 shadow-md shadow-emerald-600/25 gap-2"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Kreiraj tim</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};