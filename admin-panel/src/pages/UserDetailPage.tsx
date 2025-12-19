import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isActive: boolean;
  subscriptionType: string;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  isEarlyAdopter: boolean;
  totalAdsCreated: number;
  rating: string | null;
  totalRatings: number;
  createdAt: string;
}

interface UserDetailPageProps {
  userId: string;
  onBack: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export default function UserDetailPage({ userId, onBack }: UserDetailPageProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [isActive, setIsActive] = useState(true);
  const [subscriptionType, setSubscriptionType] = useState('free');
  const [subscriptionDays, setSubscriptionDays] = useState(30);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Korisnik nije pronađen');
      const data = await response.json();
      setUser(data);
      setIsActive(data.isActive);
      setSubscriptionType(data.subscriptionType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          isActive,
          subscriptionType,
          subscriptionDays,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Greška pri čuvanju');
      }

      setSuccess('Promene su uspešno sačuvane');
      fetchUser();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <div style={{
          width: 32,
          height: 32,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        padding: 24,
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        border: '1px solid var(--error)',
        borderRadius: 12,
        color: 'var(--error)',
      }}>
        Korisnik nije pronađen
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 0',
          marginBottom: 16,
          color: 'var(--text-secondary)',
          fontSize: 14,
        }}
      >
        ← Nazad na listu korisnika
      </button>

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{user.name}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
      </div>

      {error && (
        <div style={{
          padding: 16,
          backgroundColor: 'rgba(255, 68, 68, 0.1)',
          border: '1px solid var(--error)',
          borderRadius: 12,
          color: 'var(--error)',
          marginBottom: 24,
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: 16,
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid var(--success)',
          borderRadius: 12,
          color: 'var(--success)',
          marginBottom: 24,
        }}>
          {success}
        </div>
      )}

      <div style={{ display: 'grid', gap: 24 }}>
        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 16,
          padding: 24,
          border: '1px solid var(--border)',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
            Informacije o korisniku
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>ID</div>
              <div style={{ fontFamily: 'monospace', fontSize: 13 }}>{user.id}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Datum registracije</div>
              <div>{new Date(user.createdAt).toLocaleDateString('sr-Latn-RS')}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Ukupno oglasa</div>
              <div>{user.totalAdsCreated}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Ocena</div>
              <div>{user.rating ? `${parseFloat(user.rating).toFixed(1)} (${user.totalRatings} recenzija)` : 'Nema ocena'}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Rani korisnik</div>
              <div>{user.isEarlyAdopter ? 'Da' : 'Ne'}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Admin</div>
              <div>{user.isAdmin ? 'Da' : 'Ne'}</div>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 16,
          padding: 24,
          border: '1px solid var(--border)',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
            Upravljanje nalogom
          </h2>
          
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Status naloga</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setIsActive(true)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: isActive ? 'rgba(34, 197, 94, 0.15)' : 'var(--surface-elevated)',
                  border: isActive ? '2px solid #22C55E' : '1px solid var(--border)',
                  borderRadius: 8,
                  color: isActive ? '#22C55E' : 'var(--text)',
                  fontWeight: 500,
                }}
              >
                ✓ Aktivan
              </button>
              <button
                onClick={() => setIsActive(false)}
                style={{
                  padding: '12px 20px',
                  backgroundColor: !isActive ? 'rgba(239, 68, 68, 0.15)' : 'var(--surface-elevated)',
                  border: !isActive ? '2px solid #EF4444' : '1px solid var(--border)',
                  borderRadius: 8,
                  color: !isActive ? '#EF4444' : 'var(--text)',
                  fontWeight: 500,
                }}
              >
                ✗ Neaktivan
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Tip pretplate</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {[
                { id: 'free', label: 'Besplatno' },
                { id: 'basic', label: 'Standard' },
                { id: 'premium', label: 'Premium' },
              ].map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSubscriptionType(sub.id)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: subscriptionType === sub.id ? 'var(--primary)' : 'var(--surface-elevated)',
                    border: subscriptionType === sub.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                    borderRadius: 8,
                    color: subscriptionType === sub.id ? 'var(--accent)' : 'var(--text)',
                    fontWeight: subscriptionType === sub.id ? 600 : 400,
                  }}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>

          {subscriptionType !== 'free' && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Trajanje pretplate</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[
                  { days: 7, label: '7 dana' },
                  { days: 30, label: '30 dana' },
                  { days: 90, label: '90 dana' },
                  { days: 365, label: '1 godina' },
                ].map((option) => (
                  <button
                    key={option.days}
                    onClick={() => setSubscriptionDays(option.days)}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: subscriptionDays === option.days ? 'var(--primary)' : 'var(--surface-elevated)',
                      border: subscriptionDays === option.days ? '2px solid var(--primary)' : '1px solid var(--border)',
                      borderRadius: 8,
                      color: subscriptionDays === option.days ? 'var(--accent)' : 'var(--text)',
                      fontWeight: subscriptionDays === option.days ? 600 : 400,
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {user.subscriptionEndDate && (
            <div style={{
              padding: 16,
              backgroundColor: 'var(--surface-elevated)',
              borderRadius: 8,
              marginBottom: 24,
            }}>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Trenutna pretplata ističe
              </div>
              <div style={{ fontWeight: 500 }}>
                {new Date(user.subscriptionEndDate).toLocaleDateString('sr-Latn-RS')}
              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '14px 28px',
              backgroundColor: isSaving ? 'var(--primary-dark)' : 'var(--primary)',
              color: 'var(--accent)',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              opacity: isSaving ? 0.7 : 1,
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            {isSaving ? 'Čuvanje...' : 'Sačuvaj promene'}
          </button>
        </div>
      </div>
    </div>
  );
}
