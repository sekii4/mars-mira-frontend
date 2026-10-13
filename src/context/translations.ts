export type Language = 'bs' | 'en';

export interface Translations {
  [key: string]: {
    bs: string;
    en: string;
  };
}

export const dictionary: Translations = {
  // Navigation
  nav_brand_title: { bs: 'Marš Mira', en: 'Peace March' },
  nav_brand_sub: { bs: 'Srebrenica', en: 'Srebrenica' },
  nav_stats: { bs: 'Statistika', en: 'Statistics' },
  nav_live_map: { bs: 'Uživo mapa', en: 'Live Map' },
  nav_route: { bs: 'Trasa i punktovi', en: 'Route & Checkpoints' },
  nav_settings: { bs: 'Postavke', en: 'Settings' },
  nav_profile: { bs: 'Profil', en: 'Profile' },
  nav_logout: { bs: 'Odjavi se', en: 'Sign Out' },
  nav_login: { bs: 'Prijavi se', en: 'Sign In' },
  nav_back_home: { bs: 'Nazad na početnu', en: 'Back to Home' },

  // Settings general
  settings_title: { bs: 'Postavke', en: 'Settings' },
  settings_subtitle: {
    bs: 'Prilagodite jezik, izgled aplikacije i postavke privatnosti vašeg profila.',
    en: 'Customize language, application appearance, and your profile privacy settings.',
  },
  settings_saved_success: {
    bs: 'Postavke su uspješno ažurirane.',
    en: 'Settings updated successfully.',
  },
  settings_saving: { bs: 'Spremanje...', en: 'Saving...' },
  settings_save_changes: { bs: 'Spremi promjene', en: 'Save changes' },

  // Tabs
  tab_general: { bs: 'Pregled', en: 'Overview' },
  tab_language: { bs: 'Jezik', en: 'Language' },
  tab_theme: { bs: 'Tema i izgled', en: 'Theme & Appearance' },
  tab_privacy: { bs: 'Privatnost', en: 'Privacy' },

  // Language section
  lang_section_title: { bs: 'Jezik aplikacije', en: 'Application Language' },
  lang_section_desc: {
    bs: 'Odaberite željeni jezik za korisnički interfejs.',
    en: 'Select your preferred language for the user interface.',
  },
  lang_bs: { bs: 'Bosanski jezik', en: 'Bosnian' },
  lang_bs_desc: { bs: 'Standardni jezik projekta Marš Mira', en: 'Default language of the Peace March project' },
  lang_en: { bs: 'Engleski jezik', en: 'English' },
  lang_en_desc: { bs: 'English interface for international participants', en: 'English interface for international participants' },
  lang_active_badge: { bs: 'Aktivno', en: 'Active' },

  // Theme section
  theme_section_title: { bs: 'Tema i prikaz', en: 'Theme & Display' },
  theme_section_desc: {
    bs: 'Prilagodite izgled aplikacije prema vašim željama ili uslovima osvjetljenja.',
    en: 'Adjust the app appearance to your liking or ambient lighting conditions.',
  },
  theme_light: { bs: 'Svijetla tema', en: 'Light theme' },
  theme_light_desc: { bs: 'Čista bijela pozadina sa smaragdnim akcentima', en: 'Crisp white canvas with emerald accents' },
  theme_dark: { bs: 'Tamna tema', en: 'Dark theme' },
  theme_dark_desc: { bs: 'Ugodna za noć i štedi bateriju tokom marša', en: 'Gentle on eyes and saves battery during march' },
  theme_system: { bs: 'Sistemska tema', en: 'System theme' },
  theme_system_desc: { bs: 'Automatski prati postavke vašeg uređaja', en: 'Automatically matches your device preferences' },

  // Privacy section
  privacy_section_title: { bs: 'Privatnost i sigurnost', en: 'Privacy & Security' },
  privacy_section_desc: {
    bs: 'Kontrolišite kako se vaša lokacija i lični podaci dijele sa članovima i organizatorima.',
    en: 'Control how your location and personal data are shared with members and organizers.',
  },
  privacy_loc_title: { bs: 'Dijeljenje lokacije u grupi', en: 'Group Location Sharing' },
  privacy_loc_enabled: { bs: 'Dijeljenje lokacije je aktivno', en: 'Location sharing is active' },
  privacy_loc_disabled: { bs: 'Dijeljenje lokacije je isključeno', en: 'Location sharing is disabled' },
  privacy_loc_desc: {
    bs: 'Kada je omogućeno, članovi vaše registrovane grupe mogu vidjeti vašu poziciju na interaktivnoj mapi rute. Vaši prolazi kroz punktove se uvijek sigurno evidentiraju radi verifikacije.',
    en: 'When enabled, members of your registered group can see your position on the interactive route map. Checkpoint visits are always recorded securely for verification.',
  },
  privacy_telemetry_title: { bs: 'Sigurnost i GSS telemetrija', en: 'Safety & Emergency Telemetry' },
  privacy_telemetry_desc: {
    bs: 'GPS koordinate se koriste isključivo za potrebe sigurnosti tokom manifestacije Marš Mira (evidencija punktova, hitna pomoć i GSS službe spašavanja). Podaci se ne prosljeđuju trećim stranama.',
    en: 'GPS coordinates are strictly used for participant safety during the Peace March (checkpoint visits, medical staff, and mountain rescue services). Data is never sold or shared with third parties.',
  },
  privacy_data_export_title: { bs: 'Pregled prikupljenih podataka', en: 'Your Data Summary' },
  privacy_data_export_desc: {
    bs: 'Možete pregledati ili preuzeti sažetak podataka evidentiranih uz vaš nalog.',
    en: 'You can review or download a summary of data associated with your account.',
  },
  privacy_data_export_btn: { bs: 'Pregledaj moje podatke', en: 'View My Data' },
  privacy_data_modal_title: { bs: 'Sažetak ličnih podataka', en: 'Personal Data Summary' },
  privacy_data_modal_desc: {
    bs: 'Pregled informacija koje se čuvaju na vašem profilu u sistemu Marš Mira.',
    en: 'Overview of information stored in your Marš Mira account.',
  },
  privacy_close: { bs: 'Zatvori', en: 'Close' },
  privacy_download_json: { bs: 'Preuzmi JSON', en: 'Download JSON' },
};
