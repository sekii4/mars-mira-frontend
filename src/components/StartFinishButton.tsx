import { useEffect, useState } from 'react';
import {
  getParticipationStatus,
  startMarch,
  finishMarch,
  type MarchStatus,
} from '@/api/participation';
import { useGeolocation, type LatLng } from '@/hooks/useGeolocation';
import { getApiErrorMessage } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Square, CheckCircle2, Loader2, AlertCircle, Navigation } from 'lucide-react';

interface StartFinishButtonProps {
  // Roditelj (RouteMapPage) ovim prati status i vlastitu GPS poziciju, da ih proslijedi na mapu.
  onStatusChange?: (status: MarchStatus) => void;
  onPositionChange?: (position: LatLng | null) => void;
}

const STATUS_LABEL: Record<MarchStatus, string> = {
  registered: 'Marš nije pokrenut',
  active: 'Marš je u toku',
  finished: 'Marš je završen',
};

export const StartFinishButton = ({ onStatusChange, onPositionChange }: StartFinishButtonProps) => {
  const [status, setStatus] = useState<MarchStatus>('registered');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const res = await getParticipationStatus();
        setStatus(res.status);
      } catch (err: unknown) {
        setErrorMessage(getApiErrorMessage(err, 'Nije moguće učitati status marša.'));
      } finally {
        setIsLoading(false);
      }
    };
    loadStatus();
  }, []);

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  const { position, error: gpsError } = useGeolocation(status === 'active');

  useEffect(() => {
    onPositionChange?.(position);
  }, [position, onPositionChange]);

  const handleStart = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await startMarch();
      setStatus(res.status);
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, 'Pokretanje marša nije uspjelo. Pokušajte ponovo.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await finishMarch();
      setStatus(res.status);
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, 'Završetak marša nije uspio. Pokušajte ponovo.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Učitavanje statusa...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <Badge
          className={`rounded-full px-3.5 py-1 text-xs font-semibold ${
            status === 'active'
              ? 'bg-emerald-600 hover:bg-emerald-600 text-white'
              : status === 'finished'
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-muted text-muted-foreground border-border'
          }`}
          variant={status === 'registered' ? 'outline' : 'default'}
        >
          {STATUS_LABEL[status]}
        </Badge>

        {status === 'active' && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
            <Navigation className="h-3.5 w-3.5 animate-pulse" />
            {position ? 'GPS aktivan' : 'Traženje GPS signala...'}
          </span>
        )}

        {status === 'registered' && (
          <Button
            type="button"
            onClick={handleStart}
            disabled={isSubmitting}
            className="rounded-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-6 gap-2 shadow-sm shadow-emerald-600/25"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            <span>Pokreni marš</span>
          </Button>
        )}

        {status === 'active' && (
          <Button
            type="button"
            onClick={handleFinish}
            disabled={isSubmitting}
            variant="outline"
            className="rounded-full cursor-pointer border-rose-200 text-rose-700 hover:bg-rose-50 font-bold h-10 px-6 gap-2"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
            <span>Završi marš</span>
          </Button>
        )}

        {status === 'finished' && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Čestitamo na završetku!
          </span>
        )}
      </div>

      {(errorMessage || gpsError) && (
        <div className="flex items-start gap-2 text-xs font-semibold text-rose-700">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{errorMessage || gpsError}</span>
        </div>
      )}
    </div>
  );
};