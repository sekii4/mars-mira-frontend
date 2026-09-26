import { useState, type FormEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [teamCode, setTeamCode] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleJoinSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!teamCode.trim()) return;
    setActionNotice(`Unesen kod "${teamCode.trim().toUpperCase()}". Funkcionalnost pridruživanja grupama stiže uskoro na sljedećem sprintu!`);
    setShowJoinModal(false);
    setTeamCode('');
  };

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setActionNotice(`Grupa "${newTeamName.trim()}" će biti omogućena u narednom modulu.`);
    setShowCreateModal(false);
    setNewTeamName('');
  };

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '32px 20px',
        width: '100%',
      }}
    >
      {/* Top Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: '#FFFFFF',
              color: 'var(--primary-dark)',
              fontSize: '12px',
              fontWeight: 700,
              border: '1px solid var(--border-soft)',
              marginBottom: '10px',
            }}
          >
            <span style={{ color: 'var(--primary)' }}>●</span> Učesnički profil
          </div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              marginBottom: '6px',
            }}
          >
            Dobrodošli, {user?.first_name} {user?.last_name}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            Vaša registracija za Marš Mira je aktivna. Ovdje možete upravljati svojim timom i pregledati detalje.
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          style={{
            padding: '10px 22px',
            borderRadius: 'var(--radius-full)',
            background: '#FFFFFF',
            border: '1px solid var(--border-soft)',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#FEE2E2';
            e.currentTarget.style.color = '#DC2626';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          Odjava
        </button>
      </div>

      {/* Action Notice if triggered */}
      {actionNotice && (
        <div
          style={{
            background: 'var(--surface-mint)',
            color: 'var(--success-text)',
            padding: '14px 20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: '24px',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>ℹ️ {actionNotice}</span>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            style={{ background: 'none', border: 'none', color: 'var(--success-text)', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid: Action Cards & Profile Info */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Card 1: Grupe / Timovi */}
        <div
          style={{
            background: 'var(--surface-card)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            border: '1px solid var(--border-soft)',
            boxShadow: 'var(--shadow-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'var(--surface-mint)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                marginBottom: '16px',
              }}
            >
              👥
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
              Grupa i Tim
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5, marginBottom: '20px' }}>
              Učestvujete li samostalno ili sa prijateljima? Možete se pridružiti postojećem timu pomoću koda ili kreirati novi tim kao vođa grupe.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowJoinModal(true)}
              style={{
                flex: 1,
                padding: '12px 18px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--primary)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                boxShadow: 'var(--shadow-glow)',
                minWidth: '130px',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
            >
              Pridruži se kodu
            </button>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              style={{
                flex: 1,
                padding: '12px 18px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--surface-mint)',
                color: 'var(--primary-dark)',
                fontSize: '13px',
                fontWeight: 700,
                border: '1px solid rgba(16, 185, 129, 0.2)',
                minWidth: '130px',
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#D1FAE5')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-mint)')}
            >
              + Kreiraj tim
            </button>
          </div>
        </div>

        {/* Card 2: Lični Podaci */}
        <div
          style={{
            background: 'var(--surface-card)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            border: '1px solid var(--border-soft)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'var(--surface-mint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              marginBottom: '16px',
            }}
          >
            📋
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            Detalji profila
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-soft)' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Email</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-soft)' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Prebivalište</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{user?.city}, {user?.country}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-soft)' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Uloga</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary-dark)', textTransform: 'capitalize' }}>{user?.role}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Status verifikacije</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>Aktiviran ✓</span>
            </div>
          </div>
        </div>

        {/* Card 3: Informacije o ruti */}
        <div
          style={{
            background: 'var(--surface-card)',
            borderRadius: 'var(--radius-xl)',
            padding: '28px',
            border: '1px solid var(--border-soft)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'var(--surface-mint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              marginBottom: '16px',
            }}
          >
            🗺️
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
            Ruta Marša Mira
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.5, marginBottom: '16px' }}>
            Trasa duga preko 100 kilometara podijeljena u tri jednodnevne etape:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ padding: '8px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Dan 1: <strong>Nezuk → Liplje</strong></span>
              <span style={{ color: 'var(--text-muted)' }}>~35 km</span>
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Dan 2: <strong>Liplje → Mravinjci</strong></span>
              <span style={{ color: 'var(--text-muted)' }}>~35 km</span>
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--surface)', borderRadius: 'var(--radius-md)', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Dan 3: <strong>Mravinjci → Potočari</strong></span>
              <span style={{ color: 'var(--text-muted)' }}>~30 km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Join Team Modal */}
      {showJoinModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: '32px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Pridruži se grupi</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              Unesite 6-cifreni kod koji ste dobili od vođe vaše grupe:
            </p>
            <form onSubmit={handleJoinSubmit}>
              <input
                type="text"
                required
                placeholder="npr. MM-8492"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-soft)',
                  fontSize: '16px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textAlign: 'center',
                  marginBottom: '20px',
                }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--surface)',
                    border: '1px solid var(--border-soft)',
                    fontWeight: 600,
                    fontSize: '14px',
                  }}
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  Potvrdi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: '32px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Kreiraj novi tim</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              Unesite naziv vaše ekipe. Nakon kreiranja dobit ćete jedinstveni kod za poziv članova:
            </p>
            <form onSubmit={handleCreateSubmit}>
              <input
                type="text"
                required
                placeholder="npr. Tuzlanski maratonci"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-soft)',
                  fontSize: '14px',
                  marginBottom: '20px',
                }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--surface)',
                    border: '1px solid var(--border-soft)',
                    fontWeight: 600,
                    fontSize: '14px',
                  }}
                >
                  Odustani
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  Kreiraj tim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
