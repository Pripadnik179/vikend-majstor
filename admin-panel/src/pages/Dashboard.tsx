import { useState, useEffect } from 'react';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  earlyAdopters: number;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Greška pri učitavanju statistike');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška');
    } finally {
      setIsLoading(false);
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

  if (error) {
    return (
      <div style={{
        padding: 24,
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        border: '1px solid var(--error)',
        borderRadius: 12,
        color: 'var(--error)',
      }}>
        {error}
      </div>
    );
  }

  const statCards = [
    { label: 'Ukupno korisnika', value: stats?.totalUsers || 0, icon: '👥', color: '#3B82F6' },
    { label: 'Aktivni korisnici', value: stats?.activeUsers || 0, icon: '✅', color: '#22C55E' },
    { label: 'Premium korisnici', value: stats?.premiumUsers || 0, icon: '⭐', color: '#F59E0B' },
    { label: 'Rani korisnici', value: stats?.earlyAdopters || 0, icon: '🚀', color: '#8B5CF6' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Pregled sistema VikendMajstor
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 20,
        marginBottom: 32,
      }}>
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 16,
              padding: 24,
              border: '1px solid var(--border)',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}>
              <span style={{
                fontSize: 32,
                width: 48,
                height: 48,
                backgroundColor: `${card.color}20`,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {card.icon}
              </span>
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
              {card.value.toLocaleString()}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        backgroundColor: 'var(--surface)',
        borderRadius: 16,
        padding: 24,
        border: '1px solid var(--border)',
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>
          Brze akcije
        </h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 20px',
              backgroundColor: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text)',
              fontWeight: 500,
            }}
          >
            🔄 Osvježi statistiku
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '12px 20px',
              backgroundColor: 'var(--surface-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: 'var(--text)',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            🌐 Otvori sajt
          </a>
        </div>
      </div>
    </div>
  );
}
