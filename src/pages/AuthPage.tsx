import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MarsMiraLogo } from '@/components/MarsMiraLogo';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export const AuthPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'register' ? 'register' : 'login';

  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const switchTab = (tab: string) => {
    setSearchParams(tab === 'register' ? { tab: 'register' } : {});
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regCountry, setRegCountry] = useState('Bosna i Hercegovina');
  const [regCity, setRegCity] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle Login Submit
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMessage('Molimo unesite email adresu i lozinku.');
      return;
    }

    setIsSubmitting(true);
    try {
      const loggedUser = await login({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj.response?.data?.message || 'Greška prilikom prijave. Provjerite podatke i pokušajte ponovo.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (
      !regFirstName.trim() ||
      !regLastName.trim() ||
      !regEmail.trim() ||
      !regPassword ||
      !regConfirmPassword ||
      !regCountry.trim() ||
      !regCity.trim()
    ) {
      setErrorMessage('Molimo popunite sva obavezna polja.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Lozinka mora sadržavati najmanje 6 karaktera.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Lozinke se ne podudaraju. Molimo provjerite unos.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        first_name: regFirstName.trim(),
        last_name: regLastName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        country: regCountry.trim(),
        city: regCity.trim(),
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      const msg = errorObj.response?.data?.message || 'Došlo je do greške prilikom registracije. Pokušajte ponovo.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-8 sm:py-12 bg-radial from-emerald-50/70 via-background to-background">
      <Card className="w-full max-w-md shadow-xl border-border/80 bg-card rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="text-center flex flex-col items-center gap-2">
          <MarsMiraLogo className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl shadow-xs border border-border/40" />
          <Badge variant="outline" className="px-3 py-0.5 gap-1.5 rounded-full border-emerald-300 bg-emerald-50 text-emerald-800 text-[11px] font-semibold shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Zvanični portal Marša Mira</span>
          </Badge>
          <div className="space-y-0.5 mt-0.5">
            <CardTitle className="text-2xl font-black tracking-tight text-foreground">
              {activeTab === 'login' ? 'Dobrodošli nazad' : 'Registracija učesnika'}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {activeTab === 'login'
                ? 'Prijavite se svojim računom za pristup ruti i timu'
                : 'Kreirajte svoj lični račun za učešće u Maršu Mira'}
            </CardDescription>
          </div>
        </div>

        <CardContent className="p-0 space-y-4">
          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs sm:text-sm font-medium text-red-700 animate-in fade-in-50">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs sm:text-sm font-medium text-emerald-800 animate-in fade-in-50">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={switchTab} className="w-full space-y-4">
            <TabsList className="grid w-full grid-cols-2 rounded-full p-1 bg-muted/80 border border-border/50">
              <TabsTrigger value="login" className="rounded-full font-bold cursor-pointer text-xs sm:text-sm py-2">
                Prijava
              </TabsTrigger>
              <TabsTrigger value="register" className="rounded-full font-bold cursor-pointer text-xs sm:text-sm py-2">
                Registracija
              </TabsTrigger>
            </TabsList>

            {/* LOGIN FORM */}
            <TabsContent value="login" className="mt-0">
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-xs sm:text-sm font-semibold text-foreground/90 block">
                    Email adresa
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    required
                    placeholder="vas.email@primjer.ba"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="rounded-xl h-11 px-3.5 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-xs sm:text-sm font-semibold text-foreground/90 block">
                    Lozinka
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="rounded-xl h-11 px-3.5 text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-sm shadow-emerald-600/30 mt-2 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Prijavljivanje...</span>
                    </>
                  ) : (
                    'Prijavi se'
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* REGISTER FORM */}
            <TabsContent value="register" className="mt-0">
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-first-name" className="text-xs sm:text-sm font-semibold text-foreground/90 block">
                      Ime *
                    </Label>
                    <Input
                      id="reg-first-name"
                      type="text"
                      required
                      placeholder="npr. Tarik"
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      className="rounded-xl h-10 px-3.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-last-name" className="text-xs sm:text-sm font-semibold text-foreground/90 block">
                      Prezime *
                    </Label>
                    <Input
                      id="reg-last-name"
                      type="text"
                      required
                      placeholder="npr. Hodžić"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      className="rounded-xl h-10 px-3.5 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="reg-email" className="text-xs sm:text-sm font-semibold text-foreground/90 block">
                    Email adresa *
                  </Label>
                  <Input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="vas.email@primjer.ba"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="rounded-xl h-10 px-3.5 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-country" className="text-xs sm:text-sm font-semibold text-foreground/90 block">
                      Država *
                    </Label>
                    <Input
                      id="reg-country"
                      type="text"
                      required
                      placeholder="Bosna i Hercegovina"
                      value={regCountry}
                      onChange={(e) => setRegCountry(e.target.value)}
                      className="rounded-xl h-10 px-3.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-city" className="text-xs sm:text-sm font-semibold text-foreground/90 block">
                      Grad *
                    </Label>
                    <Input
                      id="reg-city"
                      type="text"
                      required
                      placeholder="Sarajevo"
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className="rounded-xl h-10 px-3.5 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-password" className="text-xs sm:text-sm font-semibold text-foreground/90 block">
                      Lozinka (min. 6) *
                    </Label>
                    <Input
                      id="reg-password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="rounded-xl h-10 px-3.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="reg-confirm-password" className="text-xs sm:text-sm font-semibold text-foreground/90 block">
                      Potvrda lozinke *
                    </Label>
                    <Input
                      id="reg-confirm-password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="rounded-xl h-10 px-3.5 text-sm"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-sm shadow-emerald-600/30 mt-2 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Kreiranje računa...</span>
                    </>
                  ) : (
                    'Kreiraj račun i nastavi'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>

        <div className="justify-center border-t border-border/60 pt-4 flex">
          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            {activeTab === 'login' ? (
              <>
                Nemate još račun?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('register')}
                  className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer underline underline-offset-4 ml-1"
                >
                  Registrujte se besplatno
                </button>
              </>
            ) : (
              <>
                Već imate kreiran račun?{' '}
                <button
                  type="button"
                  onClick={() => switchTab('login')}
                  className="font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer underline underline-offset-4 ml-1"
                >
                  Prijavite se ovdje
                </button>
              </>
            )}
          </p>
        </div>
      </Card>
    </div>
  );
};
