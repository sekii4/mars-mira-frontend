import { useEffect, useRef, useState } from 'react';
import { sendLocation } from '@/api/location';

const SEND_INTERVAL_MS = 15000; // koliko često se lokacija šalje na backend

export interface LatLng {
  latitude: number;
  longitude: number;
}

interface UseGeolocationResult {
  position: LatLng | null;
  error: string | null;
  isSupported: boolean;
}

// Dok je `enabled` true: prati GPS poziciju uređaja (za prikaz na mapi odmah)
// i periodično je šalje na backend (POST /location), sporije nego što se mapa osvježava.
export const useGeolocation = (enabled: boolean): UseGeolocationResult => {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);

  const latestPositionRef = useRef<LatLng | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  useEffect(() => {
    if (!enabled || !isSupported) {
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const next = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        latestPositionRef.current = next;
        setPosition(next);
        setError(null);
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? 'Dozvola za lokaciju je odbijena. Omogućite je u postavkama browsera.'
            : 'Nije moguće dohvatiti vašu lokaciju.'
        );
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
    );

    const sendCurrentPosition = () => {
      const current = latestPositionRef.current;
      if (!current) return;
      sendLocation(current).catch(() => {
        // Tiho preskoči - sljedeći pokušaj za SEND_INTERVAL_MS, nema smisla prekidati praćenje
        // zbog jednog neuspjelog zahtjeva (npr. privremeni gubitak interneta).
      });
    };

    intervalIdRef.current = setInterval(sendCurrentPosition, SEND_INTERVAL_MS);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      latestPositionRef.current = null;
    };
  }, [enabled, isSupported]);

  return { position, error, isSupported };
};