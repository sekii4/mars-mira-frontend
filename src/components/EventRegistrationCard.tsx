import { useEffect, useState } from 'react';
import { AlertCircle, CalendarDays, CheckCircle2, Loader2, UserRoundCheck } from 'lucide-react';
import { getParticipationStatus, registerForCurrentEvent, type ParticipationResponse } from '@/api/participation';
import { getApiErrorMessage } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EventRegistrationCardProps {
  onRegistrationStatusChange?: (isRegistered: boolean) => void;
}

const formatDate = (date: string | null | undefined) => date
  ? new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString('bs-BA')
  : null;

export const EventRegistrationCard = ({ onRegistrationStatusChange }: EventRegistrationCardProps) => {
  const [details, setDetails] = useState<ParticipationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    getParticipationStatus()
      .then((result) => {
        setDetails(result);
        onRegistrationStatusChange?.(Boolean(result.is_registered));
      })
      .catch((error: unknown) => setErrorMessage(getApiErrorMessage(error, 'Nije moguće učitati podatke o prijavi.')))
      .finally(() => setIsLoading(false));
  }, [onRegistrationStatusChange]);

  const handleRegister = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const result = await registerForCurrentEvent();
      setDetails(result);
      onRegistrationStatusChange?.(Boolean(result.is_registered));
      setIsDialogOpen(false);
      setSuccessMessage(result.message || 'Uspješno ste prijavljeni na Marš Mira.');
    } catch (error: unknown) {
      setErrorMessage(getApiErrorMessage(error, 'Prijava nije uspjela. Pokušajte ponovo.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const event = details?.event;
  const isRegistered = Boolean(details?.is_registered);
  const dateRange = event && (formatDate(event.start_date) || formatDate(event.end_date))
    ? `${formatDate(event.start_date) || '—'} – ${formatDate(event.end_date) || '—'}`
    : null;

  return (
    <>
      <Card className="rounded-3xl border-emerald-200/70 bg-gradient-to-br from-emerald-50/70 via-card to-card p-5 sm:p-7 shadow-sm [--card-spacing:0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold">Prijava na Marš Mira</h2>
                {isRegistered && <Badge className="rounded-full bg-emerald-700 text-white gap-1"><CheckCircle2 className="h-3 w-3" /> Prijavljeni ste</Badge>}
              </div>
              {isLoading ? (
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Učitavanje događaja...</p>
              ) : event ? (
                <>
                  <p className="font-semibold text-foreground">{event.name}</p>
                  {dateRange && <p className="text-sm text-muted-foreground">{dateRange}</p>}
                  {event.description && <p className="text-sm text-muted-foreground max-w-3xl">{event.description}</p>}
                  {isRegistered && <p className="text-sm text-emerald-800">Vaš profil je prijavljen na ovaj događaj.</p>}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Trenutno nema raspisanog događaja za prijavu.</p>
              )}
            </div>
          </div>
          {!isLoading && event && !isRegistered && (
            <Button type="button" onClick={() => { setErrorMessage(''); setIsDialogOpen(true); }} className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 self-start sm:self-center">
              <UserRoundCheck className="h-4 w-4" /> Prijavi se na događaj
            </Button>
          )}
        </div>
        {errorMessage && <div className="mt-4 flex items-start gap-2 text-sm font-semibold text-rose-700"><AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{errorMessage}</span></div>}
        {successMessage && <div className="mt-4 text-sm font-semibold text-emerald-800">{successMessage}</div>}
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md p-6 sm:p-8 rounded-3xl space-y-4">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl sm:text-2xl font-black">Potvrda prijave</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              Jeste li sigurni da se želite prijaviti na <strong>{event?.name}</strong>{dateRange ? ` (${dateRange})` : ''}?
              Vaši podaci s profila bit će povezani s ovom prijavom.
            </DialogDescription>
          </DialogHeader>
          {errorMessage && <div className="flex items-start gap-2 text-sm font-semibold text-rose-700"><AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{errorMessage}</span></div>}
          <DialogFooter className="gap-2 sm:gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting} className="rounded-full">Odustani</Button>
            <Button type="button" onClick={() => void handleRegister()} disabled={isSubmitting} className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Da, prijavi me
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
