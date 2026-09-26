import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

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

  const switchTab = (tab: 'login' | 'register') => {
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

  // UI status
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
      await login({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      navigate('/dashboard');
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
    <div
      style={{
        minHeight: 'calc(100vh - 70px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        background: 'radial-gradient(ellipse at top, #ECFDF5 0%, #F8FAF8 70%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: activeTab === 'register' ? '540px' : '440px',
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-soft)',
          boxShadow: 'var(--shadow-card)',
          padding: '36px 32px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header Badge & Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--surface-mint)',
              color: 'var(--primary-dark)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '12px',
              border: '1px solid rgba(16, 185, 129, 0.18)',
            }}
          >
            <span style={{ fontSize: '14px' }}>🌿</span> Marš Mira Srebrenica
          </div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
              marginBottom: '6px',
            }}
          >
            {activeTab === 'login' ? 'Dobrodošli nazad' : 'Prijava novog učesnika'}
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
            }}
          >
            {activeTab === 'login'
              ? 'Prijavite se svojim računom za pristup ruti i timu'
              : 'Kreirajte svoj račun za učešće u Maršu Mira'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'var(--surface)',
            padding: '4px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-soft)',
            marginBottom: '24px',
          }}
        >
          <button
            type="button"
            onClick={() => switchTab('login')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 'var(--radius-full)',
              fontSize: '14px',
              fontWeight: 700,
              color: activeTab === 'login' ? 'var(--text-main)' : 'var(--text-muted)',
              background: activeTab === 'login' ? '#FFFFFF' : 'transparent',
              boxShadow: activeTab === 'login' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
            }}
          >
            Prijava
          </button>
          <button
            type="button"
            onClick={() => switchTab('register')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: 'var(--radius-full)',
              fontSize: '14px',
              fontWeight: 700,
              color: activeTab === 'register' ? 'var(--text-main)' : 'var(--text-muted)',
              background: activeTab === 'register' ? '#FFFFFF' : 'transparent',
              boxShadow: activeTab === 'register' ? 'var(--shadow-sm)' : 'none',
              cursor: 'pointer',
            }}
          >
            Registracija
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              background: 'var(--error-bg)',
              color: 'var(--error-text)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              border: '1px solid rgba(186, 26, 26, 0.2)',
            }}
          >
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div
            style={{
              background: 'var(--success-bg)',
              color: 'var(--success-text)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* ==================================== */}
        {/* LOGIN FORM */}
        {/* ==================================== */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label
                htmlFor="login-email"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '6px',
                }}
              >
                Email adresa
              </label>
              <input
                id="login-email"
                type="email"
                required
                placeholder="vas.email@primjer.ba"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-soft)',
                  background: '#FFFFFF',
                  fontSize: '14px',
                  color: 'var(--text-main)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--border-focus)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-soft)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '6px',
                }}
              >
                Lozinka
              </label>
              <input
                id="login-password"
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-soft)',
                  background: '#FFFFFF',
                  fontSize: '14px',
                  color: 'var(--text-main)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--border-focus)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-soft)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary)',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 700,
                boxShadow: 'var(--shadow-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '8px',
                opacity: isSubmitting ? 0.7 : 1,
              }}
              onMouseOver={(e) => {
                if (!isSubmitting) e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) e.currentTarget.style.backgroundColor = 'var(--primary)';
              }}
            >
              {isSubmitting ? (
                <>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid #FFFFFF',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }}
                  />
                  <span>Prijavljivanje...</span>
                </>
              ) : (
                'Prijavi se'
              )}
            </button>
          </form>
        )}

        {/* ==================================== */}
        {/* REGISTER FORM */}
        {/* ==================================== */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* First and Last Name row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label
                  htmlFor="reg-first-name"
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '6px',
                  }}
                >
                  Ime *
                </label>
                <input
                  id="reg-first-name"
                  type="text"
                  required
                  placeholder="npr. Tarik"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-soft)',
                    background: '#FFFFFF',
                    fontSize: '14px',
                    color: 'var(--text-main)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--border-focus)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-soft)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="reg-last-name"
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '6px',
                  }}
                >
                  Prezime *
                </label>
                <input
                  id="reg-last-name"
                  type="text"
                  required
                  placeholder="npr. Hodžić"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-soft)',
                    background: '#FFFFFF',
                    fontSize: '14px',
                    color: 'var(--text-main)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--border-focus)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-soft)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="reg-email"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  marginBottom: '6px',
                }}
              >
                Email adresa *
              </label>
              <input
                id="reg-email"
                type="email"
                required
                placeholder="vas.email@primjer.ba"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-soft)',
                  background: '#FFFFFF',
                  fontSize: '14px',
                  color: 'var(--text-main)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--border-focus)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border-soft)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Country and City */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label
                  htmlFor="reg-country"
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '6px',
                  }}
                >
                  Država *
                </label>
                <input
                  id="reg-country"
                  type="text"
                  required
                  placeholder="npr. Bosna i Hercegovina"
                  value={regCountry}
                  onChange={(e) => setRegCountry(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-soft)',
                    background: '#FFFFFF',
                    fontSize: '14px',
                    color: 'var(--text-main)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--border-focus)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-soft)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="reg-city"
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '6px',
                  }}
                >
                  Grad *
                </label>
                <input
                  id="reg-city"
                  type="text"
                  required
                  placeholder="npr. Sarajevo ili Tuzla"
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-soft)',
                    background: '#FFFFFF',
                    fontSize: '14px',
                    color: 'var(--text-main)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--border-focus)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-soft)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password and Confirm Password */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label
                  htmlFor="reg-password"
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '6px',
                  }}
                >
                  Lozinka (min. 6 znakova) *
                </label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-soft)',
                    background: '#FFFFFF',
                    fontSize: '14px',
                    color: 'var(--text-main)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--border-focus)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-soft)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label
                  htmlFor="reg-confirm-password"
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginBottom: '6px',
                  }}
                >
                  Potvrda lozinke *
                </label>
                <input
                  id="reg-confirm-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-soft)',
                    background: '#FFFFFF',
                    fontSize: '14px',
                    color: 'var(--text-main)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--border-focus)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-soft)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary)',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 700,
                boxShadow: 'var(--shadow-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '10px',
                opacity: isSubmitting ? 0.7 : 1,
              }}
              onMouseOver={(e) => {
                if (!isSubmitting) e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) e.currentTarget.style.backgroundColor = 'var(--primary)';
              }}
            >
              {isSubmitting ? (
                <>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      border: '2px solid #FFFFFF',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }}
                  />
                  <span>Kreiranje računa...</span>
                </>
              ) : (
                'Kreiraj račun i nastavi'
              )}
            </button>
          </form>
        )}

        {/* Footer Prompt */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
          {activeTab === 'login' ? (
            <p>
              Nemate još račun?{' '}
              <button
                type="button"
                onClick={() => switchTab('register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '13px',
                }}
              >
                Registrujte se besplatno
              </button>
            </p>
          ) : (
            <p>
              Već imate kreiran račun?{' '}
              <button
                type="button"
                onClick={() => switchTab('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '13px',
                }}
              >
                Prijavite se ovdje
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
