import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme, type ThemeMode } from '@/context/ThemeContext';
import { useLanguage, type Language } from '@/context/LanguageContext';
import { updateParticipantSettings } from '@/api/participant';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Globe,
  Sun,
  Moon,
  Laptop,
  ShieldCheck,
  MapPin,
  Check,
  Lock,
  Download,
  Info,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, isAuthenticated, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const [localSharingOverride, setLocalSharingOverride] = useState<boolean | null>(null);
  const locationSharing = localSharingOverride !== null ? localSharingOverride : user?.location_sharing !== false;
  const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [dataDialogOpen, setDataDialogOpen] = useState(false);

  const handleLanguageChange = async (newLang: Language) => {
    setLanguage(newLang);
    setFeedbackMessage({ text: t('settings_saved_success'), type: 'success' });
    setTimeout(() => setFeedbackMessage(null), 3000);

    if (isAuthenticated && user?.role === 'participant') {
      try {
        await updateParticipantSettings({ language: newLang });
        updateUser({ ...user, language: newLang });
      } catch (err) {
        console.error('Greška pri ažuriranju jezika:', err);
      }
    }
  };

  const handleThemeChange = async (newTheme: ThemeMode) => {
    setTheme(newTheme);
    setFeedbackMessage({ text: t('settings_saved_success'), type: 'success' });
    setTimeout(() => setFeedbackMessage(null), 3000);

    if (isAuthenticated && user?.role === 'participant') {
      try {
        await updateParticipantSettings({ theme: newTheme });
        updateUser({ ...user, theme: newTheme });
      } catch (err) {
        console.error('Greška pri ažuriranju teme:', err);
      }
    }
  };

  const handleToggleLocationSharing = async (checked: boolean) => {
    setLocalSharingOverride(checked);
    setIsUpdatingPrivacy(true);
    setFeedbackMessage(null);

    try {
      if (isAuthenticated && user?.role === 'participant') {
        const res = await updateParticipantSettings({ location_sharing: checked });
        if (res.success) {
          updateUser({ ...user, location_sharing: checked });
          setFeedbackMessage({ text: t('settings_saved_success'), type: 'success' });
        }
      } else {
        setFeedbackMessage({ text: t('settings_saved_success'), type: 'success' });
      }
    } catch {
      setLocalSharingOverride(null);
      setFeedbackMessage({
        text: language === 'bs' ? 'Greška pri ažuriranju postavki lokacije.' : 'Failed to update location sharing.',
        type: 'error',
      });
    } finally {
      setIsUpdatingPrivacy(false);
      setTimeout(() => setFeedbackMessage(null), 3500);
    }
  };

  const handleDownloadUserData = () => {
    const exportData = {
      user: {
        uid: user?.uid,
        first_name: user?.first_name,
        last_name: user?.last_name,
        email: user?.email,
        role: user?.role,
        country: user?.country,
        city: user?.city,
      },
      preferences: {
        theme,
        language,
        location_sharing: locationSharing,
      },
      exported_at: new Date().toISOString(),
      platform: 'Marš Mira Srebrenica',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mars-mira-podaci-${user?.uid || 'korisnik'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button asChild variant="ghost" className="rounded-full gap-2 -ml-3 font-semibold self-start">
          <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'}>
            <ArrowLeft className="h-4 w-4" />
            <span>{t('nav_back_home')}</span>
          </Link>
        </Button>

        {feedbackMessage && (
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all animate-in fade-in slide-in-from-top-1 ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
        )}
      </div>

      {/* Main Title Banner */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {t('settings_title')}
            </h1>
          </div>
          {user && (
            <Badge variant="outline" className="ml-auto rounded-full border-emerald-300 text-emerald-700 dark:text-emerald-300 px-3 py-1 font-semibold">
              {user.role === 'admin' ? 'Administrator' : language === 'bs' ? 'Učesnik' : 'Participant'}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed pl-13">
          {t('settings_subtitle')}
        </p>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="all" className="w-full space-y-6">
        <TabsList className="bg-muted/60 p-1.5 rounded-2xl grid grid-cols-4 max-w-xl">
          <TabsTrigger value="all" className="rounded-xl font-bold text-xs sm:text-sm">
            {t('tab_general')}
          </TabsTrigger>
          <TabsTrigger value="language" className="rounded-xl font-bold text-xs sm:text-sm">
            {t('tab_language')}
          </TabsTrigger>
          <TabsTrigger value="theme" className="rounded-xl font-bold text-xs sm:text-sm">
            {t('tab_theme')}
          </TabsTrigger>
          <TabsTrigger value="privacy" className="rounded-xl font-bold text-xs sm:text-sm">
            {t('tab_privacy')}
          </TabsTrigger>
        </TabsList>

        {/* Overview (All) Tab */}
        <TabsContent value="all" className="space-y-6">
          {/* Section 1: Jezik (Language) */}
          <Card className="rounded-3xl border-border/80 shadow-md">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center gap-2.5">
                <Globe className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-lg font-bold">{t('lang_section_title')}</CardTitle>
              </div>
              <CardDescription>{t('lang_section_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Bosnian Option */}
              <button
                type="button"
                onClick={() => handleLanguageChange('bs')}
                className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  language === 'bs'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs ring-1 ring-emerald-500'
                    : 'border-border hover:border-emerald-300 hover:bg-muted/40'
                }`}
              >
                <div className="h-10 w-10 rounded-xl bg-background border flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                  🇧🇦
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{t('lang_bs')}</span>
                    {language === 'bs' && (
                      <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{t('lang_bs_desc')}</p>
                </div>
              </button>

              {/* English Option */}
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  language === 'en'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs ring-1 ring-emerald-500'
                    : 'border-border hover:border-emerald-300 hover:bg-muted/40'
                }`}
              >
                <div className="h-10 w-10 rounded-xl bg-background border flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
                  🇬🇧
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground">{t('lang_en')}</span>
                    {language === 'en' && (
                      <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{t('lang_en_desc')}</p>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Section 2: Tema (Theme) */}
          <Card className="rounded-3xl border-border/80 shadow-md">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center gap-2.5">
                <Sun className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-lg font-bold">{t('theme_section_title')}</CardTitle>
              </div>
              <CardDescription>{t('theme_section_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Light Mode */}
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                    : 'border-border hover:border-emerald-300 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Sun className="h-5 w-5" />
                  </div>
                  {theme === 'light' && (
                    <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <span className="font-bold text-sm text-foreground">{t('theme_light')}</span>
                <span className="text-xs text-muted-foreground mt-1">{t('theme_light_desc')}</span>
              </button>

              {/* Dark Mode */}
              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                    : 'border-border hover:border-emerald-300 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Moon className="h-5 w-5" />
                  </div>
                  {theme === 'dark' && (
                    <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <span className="font-bold text-sm text-foreground">{t('theme_dark')}</span>
                <span className="text-xs text-muted-foreground mt-1">{t('theme_dark_desc')}</span>
              </button>

              {/* System Mode */}
              <button
                type="button"
                onClick={() => handleThemeChange('system')}
                className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                    : 'border-border hover:border-emerald-300 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className="h-9 w-9 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                    <Laptop className="h-5 w-5" />
                  </div>
                  {theme === 'system' && (
                    <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <span className="font-bold text-sm text-foreground">{t('theme_system')}</span>
                <span className="text-xs text-muted-foreground mt-1">{t('theme_system_desc')}</span>
              </button>
            </CardContent>
          </Card>

          {/* Section 3: Privatnost (Privacy) */}
          <Card className="rounded-3xl border-border/80 shadow-md">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-lg font-bold">{t('privacy_section_title')}</CardTitle>
              </div>
              <CardDescription>{t('privacy_section_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-6">
              {/* Location Sharing Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-muted/40 border border-border/70">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span className="font-bold text-sm sm:text-base text-foreground">
                      {t('privacy_loc_title')}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs rounded-full font-semibold px-2 py-0.5 ${
                        locationSharing
                          ? 'border-emerald-300 bg-emerald-50/80 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'border-slate-300 bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400'
                      }`}
                    >
                      {locationSharing ? t('privacy_loc_enabled') : t('privacy_loc_disabled')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('privacy_loc_desc')}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {isUpdatingPrivacy && <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />}
                  <Switch
                    checked={locationSharing}
                    onCheckedChange={handleToggleLocationSharing}
                    disabled={isUpdatingPrivacy}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              {/* Safety & Telemetry info */}
              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/60">
                <Info className="h-5 w-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-xs sm:text-sm text-emerald-950 dark:text-emerald-200">
                    {t('privacy_telemetry_title')}
                  </h4>
                  <p className="text-xs text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
                    {t('privacy_telemetry_desc')}
                  </p>
                </div>
              </div>

              {/* Data Summary & Export */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/70">
                <div>
                  <h4 className="font-bold text-sm text-foreground">{t('privacy_data_export_title')}</h4>
                  <p className="text-xs text-muted-foreground">{t('privacy_data_export_desc')}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDataDialogOpen(true)}
                  className="rounded-full gap-2 font-semibold text-xs h-9 px-4 cursor-pointer self-start sm:self-center"
                >
                  <Lock className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{t('privacy_data_export_btn')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dedicated Language Tab */}
        <TabsContent value="language" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-md">
            <CardHeader className="p-6">
              <div className="flex items-center gap-2.5">
                <Globe className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-lg font-bold">{t('lang_section_title')}</CardTitle>
              </div>
              <CardDescription>{t('lang_section_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleLanguageChange('bs')}
                  className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                    language === 'bs'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                      : 'border-border hover:border-emerald-300 hover:bg-muted/40'
                  }`}
                >
                  <div className="h-12 w-12 rounded-xl bg-background border flex items-center justify-center font-bold text-xl shrink-0 shadow-2xs">
                    🇧🇦
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-foreground">{t('lang_bs')}</span>
                      {language === 'bs' && (
                        <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t('lang_bs_desc')}</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleLanguageChange('en')}
                  className={`flex items-start gap-4 p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                    language === 'en'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                      : 'border-border hover:border-emerald-300 hover:bg-muted/40'
                  }`}
                >
                  <div className="h-12 w-12 rounded-xl bg-background border flex items-center justify-center font-bold text-xl shrink-0 shadow-2xs">
                    🇬🇧
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-foreground">{t('lang_en')}</span>
                      {language === 'en' && (
                        <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{t('lang_en_desc')}</p>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dedicated Theme Tab */}
        <TabsContent value="theme" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-md">
            <CardHeader className="p-6">
              <div className="flex items-center gap-2.5">
                <Sun className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-lg font-bold">{t('theme_section_title')}</CardTitle>
              </div>
              <CardDescription>{t('theme_section_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`flex flex-col items-start p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                    : 'border-border hover:border-emerald-300 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Sun className="h-6 w-6" />
                  </div>
                  {theme === 'light' && (
                    <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <span className="font-bold text-base text-foreground">{t('theme_light')}</span>
                <span className="text-xs text-muted-foreground mt-1">{t('theme_light_desc')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`flex flex-col items-start p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                    : 'border-border hover:border-emerald-300 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-4">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Moon className="h-6 w-6" />
                  </div>
                  {theme === 'dark' && (
                    <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <span className="font-bold text-base text-foreground">{t('theme_dark')}</span>
                <span className="text-xs text-muted-foreground mt-1">{t('theme_dark_desc')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('system')}
                className={`flex flex-col items-start p-5 rounded-2xl border text-left transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                    : 'border-border hover:border-emerald-300 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                    <Laptop className="h-6 w-6" />
                  </div>
                  {theme === 'system' && (
                    <span className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <span className="font-bold text-base text-foreground">{t('theme_system')}</span>
                <span className="text-xs text-muted-foreground mt-1">{t('theme_system_desc')}</span>
              </button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dedicated Privacy Tab */}
        <TabsContent value="privacy" className="space-y-4">
          <Card className="rounded-3xl border-border/80 shadow-md">
            <CardHeader className="p-6">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <CardTitle className="text-lg font-bold">{t('privacy_section_title')}</CardTitle>
              </div>
              <CardDescription>{t('privacy_section_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-muted/40 border border-border/70">
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span className="font-bold text-base text-foreground">
                      {t('privacy_loc_title')}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-xs rounded-full font-semibold px-2 py-0.5 ${
                        locationSharing
                          ? 'border-emerald-300 bg-emerald-50/80 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'border-slate-300 bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-400'
                      }`}
                    >
                      {locationSharing ? t('privacy_loc_enabled') : t('privacy_loc_disabled')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t('privacy_loc_desc')}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  {isUpdatingPrivacy && <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />}
                  <Switch
                    checked={locationSharing}
                    onCheckedChange={handleToggleLocationSharing}
                    disabled={isUpdatingPrivacy}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/60">
                <Info className="h-5 w-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-200">
                    {t('privacy_telemetry_title')}
                  </h4>
                  <p className="text-xs text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
                    {t('privacy_telemetry_desc')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/70">
                <div>
                  <h4 className="font-bold text-sm text-foreground">{t('privacy_data_export_title')}</h4>
                  <p className="text-xs text-muted-foreground">{t('privacy_data_export_desc')}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDataDialogOpen(true)}
                  className="rounded-full gap-2 font-semibold text-xs h-9 px-4 cursor-pointer self-start sm:self-center"
                >
                  <Lock className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{t('privacy_data_export_btn')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Data Dialog */}
      <Dialog open={dataDialogOpen} onOpenChange={setDataDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-600" />
              <span>{t('privacy_data_modal_title')}</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              {t('privacy_data_modal_desc')}
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 space-y-3 rounded-2xl bg-muted/50 p-4 border text-xs sm:text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">ID korisnika:</span>
              <span className="font-mono font-bold text-foreground">#{user?.uid ?? 'Gost'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Ime i prezime:</span>
              <span className="font-semibold text-foreground">
                {user ? `${user.first_name} ${user.last_name}` : 'Nije prijavljen'}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Email adresa:</span>
              <span className="font-semibold text-foreground">{user?.email ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Uloga:</span>
              <span className="font-semibold text-foreground capitalize">{user?.role ?? 'gost'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Država i grad:</span>
              <span className="font-semibold text-foreground">
                {user?.city ? `${user.city}, ${user.country}` : 'Nije specificirano'}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Dijeljenje lokacije:</span>
              <span className={`font-semibold ${locationSharing ? 'text-emerald-600' : 'text-slate-500'}`}>
                {locationSharing ? 'Aktivno' : 'Onemogućeno'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tema / Jezik:</span>
              <span className="font-semibold text-foreground uppercase">{theme} / {language}</span>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadUserData}
              className="rounded-full gap-2 font-semibold text-xs h-9 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              <span>{t('privacy_download_json')}</span>
            </Button>
            <DialogClose asChild>
              <Button size="sm" className="rounded-full font-semibold text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">
                {t('privacy_close')}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
