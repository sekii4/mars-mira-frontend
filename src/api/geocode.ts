// Pretraga mjesta po nazivu preko OpenStreetMap Nominatim servisa (besplatan, bez API ključa).
// Namjerno koristi običan fetch, a ne apiClient, da se JWT token ne šalje trećoj strani.
// Pravila servisa: najviše 1 zahtjev u sekundi i bez automatskog dovršavanja dok se kuca,
// zato se pretraga pokreće tek na Enter / klik na "Traži".

export interface PlaceResult {
  name: string;
  displayName: string;
  lat: number;
  long: number;
}

interface NominatimItem {
  lat: string;
  lon: string;
  name?: string;
  display_name: string;
}

export const searchPlaces = async (query: string): Promise<PlaceResult[]> => {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', query);
  url.searchParams.set('limit', '5');
  url.searchParams.set('countrycodes', 'ba');
  url.searchParams.set('accept-language', 'bs');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Pretraga mjesta trenutno nije dostupna.');
  }

  const items = (await response.json()) as NominatimItem[];
  return items.map((item) => ({
    name: item.name || item.display_name.split(',')[0].trim(),
    displayName: item.display_name,
    lat: Number(item.lat),
    long: Number(item.lon),
  }));
};