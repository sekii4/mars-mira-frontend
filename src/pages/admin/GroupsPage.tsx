import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listGroups, getGroupDetail, type AdminGroup, type AdminGroupDetail } from '@/api/admin';
import type { MarchStatus } from '@/api/participation';
import { getApiErrorMessage } from '@/api/errors';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ArrowLeft, Loader2, AlertCircle, Users, KeyRound, Crown } from 'lucide-react';

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

export const GroupsPage = () => {
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [selectedGid, setSelectedGid] = useState<number | null>(null);
  const [detail, setDetail] = useState<AdminGroupDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    listGroups()
      .then((res) => setGroups(res.groups))
      .catch((err: unknown) => setErrorMessage(getApiErrorMessage(err, 'Nije moguće učitati grupe.')))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (selectedGid === null) {
      return;
    }

    getGroupDetail(selectedGid)
      .then((res) => setDetail(res.group))
      .catch(() => setDetail(null))
      .finally(() => setIsDetailLoading(false));
  }, [selectedGid]);

  const handleCardClick = (gid: number) => {
    setDetail(null);
    setIsDetailLoading(true);
    setSelectedGid(gid);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-12 space-y-6">
      <Button asChild variant="ghost" className="rounded-full gap-2 -ml-3 font-semibold">
        <Link to="/admin">
          <ArrowLeft className="h-4 w-4" />
          <span>Nazad na admin panel</span>
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Grupe</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isLoading ? 'Učitavanje...' : `${groups.length} ${groups.length === 1 ? 'grupa' : 'grupa'} ukupno`}
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
          <span className="font-semibold text-sm">Učitavanje grupa...</span>
        </div>
      ) : groups.length === 0 ? (
        <Card className="rounded-3xl border-border py-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Users className="h-8 w-8" />
          <span className="font-semibold text-sm">Nijedna grupa još nije kreirana.</span>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((g) => (
            <Card
              key={g.gid}
              onClick={() => handleCardClick(g.gid)}
              className="rounded-3xl border-border p-5 sm:p-6 [--card-spacing:0] space-y-4 cursor-pointer hover:shadow-md hover:border-emerald-200 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-foreground text-lg leading-snug">{g.name}</h3>
                <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white rounded-full px-3 py-0.5 text-xs font-semibold shrink-0 gap-1">
                  <Users className="h-3 w-3" />
                  {g.member_count}
                </Badge>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <KeyRound className="h-3.5 w-3.5" />
                <span className="font-mono tracking-wider">{g.join_code}</span>
              </div>

              {g.created_by_first_name && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <Crown className="h-3.5 w-3.5 text-amber-500" />
                  <span>
                    Vođa: {g.created_by_first_name} {g.created_by_last_name}
                  </span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Detalj grupe sa listom članova */}
      <Dialog
        open={selectedGid !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedGid(null);
            setDetail(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg p-6 sm:p-8 rounded-3xl space-y-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-black">{detail?.name || 'Detalji grupe'}</DialogTitle>
            <DialogDescription>
              {detail ? `Kod grupe: ${detail.join_code}` : 'Učitavanje...'}
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : detail ? (
            <div className="space-y-2">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Članovi ({detail.members.length})
              </div>
              <ul className="space-y-2 max-h-80 overflow-y-auto">
                {detail.members.map((m) => (
                  <li
                    key={m.uid}
                    className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-3.5 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-foreground truncate">
                        {m.first_name} {m.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {m.city}, {m.country}
                      </div>
                    </div>
                    <StatusBadge status={m.status} />
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-sm text-rose-700 font-semibold py-4">
              Nije moguće učitati detalje grupe.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};