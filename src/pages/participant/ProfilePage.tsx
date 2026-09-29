import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile } from '@/api/participant';
import { getApiErrorMessage } from '@/api/errors';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [lastName, setLastName] = useState(user?.last_name ?? '');
  const [country, setCountry] = useState(user?.country ?? '');
  const [city, setCity] = useState(user?.city ?? '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!firstName.trim() || !lastName.trim() || !country.trim() || !city.trim()) {
      setErrorMessage('Molimo popunite sva polja.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        country: country.trim(),
        city: city.trim(),
      });
      updateUser(res.user);
      setSuccessMessage(res.message || 'Profil je uspješno ažuriran.');
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, 'Greška prilikom spremanja profila. Pokušajte ponovo.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-6 sm:px-10 py-10 sm:py-12 space-y-6">
      <Button asChild variant="ghost" className="rounded-full gap-2 -ml-3 font-semibold">
        <Link to="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          <span>Nazad na početnu</span>
        </Link>
      </Button>

      <Card className="shadow-md rounded-3xl p-6 sm:p-8 [--card-spacing:0] space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Uredi profil</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ažurirajte svoje lične podatke. Email adresa se ne može mijenjati.
          </p>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-first-name" className="text-sm font-semibold text-foreground/90 block">
                Ime
              </Label>
              <Input
                id="profile-first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={100}
                className="h-12 rounded-xl px-4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-last-name" className="text-sm font-semibold text-foreground/90 block">
                Prezime
              </Label>
              <Input
                id="profile-last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength={100}
                className="h-12 rounded-xl px-4"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-email" className="text-sm font-semibold text-foreground/90 block">
              Email
            </Label>
            <Input
              id="profile-email"
              value={user?.email ?? ''}
              disabled
              className="h-12 rounded-xl px-4"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-country" className="text-sm font-semibold text-foreground/90 block">
                Država
              </Label>
              <Input
                id="profile-country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                maxLength={100}
                className="h-12 rounded-xl px-4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-city" className="text-sm font-semibold text-foreground/90 block">
                Grad
              </Label>
              <Input
                id="profile-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                maxLength={100}
                className="h-12 rounded-xl px-4"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/25 gap-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isSubmitting ? 'Spremanje...' : 'Spremi promjene'}</span>
          </Button>
        </form>
      </Card>
    </div>
  );
};