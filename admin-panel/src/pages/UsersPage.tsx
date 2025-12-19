import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isActive: boolean;
  subscriptionType: string;
  isEarlyAdopter: boolean;
  createdAt: string;
}

interface UsersPageProps {
  onSelectUser: (id: string) => void;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export default function UsersPage({ onSelectUser }: UsersPageProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [filter, search]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('filter', filter);
      if (search) params.append('search', search);
      
      const response = await fetch(`${API_URL}/api/admin/users?${params}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Greška pri učitavanju korisnika');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška');
    } finally {
      setIsLoading(false);
    }
  };

  const filters = [
    { id: 'all', label: 'Svi' },
    { id: 'active', label: 'Aktivni' },
    { id: 'inactive', label: 'Neaktivni' },
    { id: 'premium', label: 'Premium' },
  ];

  const getSubscriptionBadge = (type: string, isEarlyAdopter: boolean) => {
    if (isEarlyAdopter) return { label: 'Rani korisnik', color: '#8B5CF6' };
    switch (type) {
      case 'premium': return { label: 'Premium', color: '#F59E0B' };
      case 'basic': return { label: 'Standard', color: '#3B82F6' };
      default: return { label: 'Besplatno', color: '#6B7280' };
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Korisnici</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Upravljanje korisnicima platforme
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: 16,
        marginBottom: 24,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="Pretraži po imenu ili email-u..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: 250,
            padding: '12px 16px',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            color: 'var(--text)',
            fontSize: 14,
          }}
        />
        
        <div style={{ display: 'flex', gap: 8 }}>
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '10px 16px',
                backgroundColor: filter === f.id ? 'var(--primary)' : 'var(--surface)',
                color: filter === f.id ? 'var(--accent)' : 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontWeight: filter === f.id ? 600 : 400,
                fontSize: 14,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
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
      ) : error ? (
        <div style={{
          padding: 24,
          backgroundColor: 'rgba(255, 68, 68, 0.1)',
          border: '1px solid var(--error)',
          borderRadius: 12,
          color: 'var(--error)',
        }}>
          {error}
        </div>
      ) : (
        <div style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 16,
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 14 }}>
                  Korisnik
                </th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 14 }}>
                  Status
                </th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 14 }}>
                  Pretplata
                </th>
                <th style={{ padding: 16, textAlign: 'left', fontWeight: 600, color: 'var(--text-secondary)', fontSize: 14 }}>
                  Datum registracije
                </th>
                <th style={{ padding: 16 }}></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const badge = getSubscriptionBadge(user.subscriptionType, user.isEarlyAdopter);
                return (
                  <tr
                    key={user.id}
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <td style={{ padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          backgroundColor: 'var(--primary)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          color: 'var(--accent)',
                        }}>
                          {user.name?.charAt(0).toUpperCase() || 'K'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                            {user.name}
                            {user.isAdmin && (
                              <span style={{
                                padding: '2px 6px',
                                backgroundColor: 'var(--error)',
                                color: '#FFF',
                                borderRadius: 4,
                                fontSize: 10,
                                fontWeight: 600,
                              }}>
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: 16 }}>
                      <span style={{
                        padding: '4px 10px',
                        backgroundColor: user.isActive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: user.isActive ? '#22C55E' : '#EF4444',
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 500,
                      }}>
                        {user.isActive ? 'Aktivan' : 'Neaktivan'}
                      </span>
                    </td>
                    <td style={{ padding: 16 }}>
                      <span style={{
                        padding: '4px 10px',
                        backgroundColor: `${badge.color}20`,
                        color: badge.color,
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 500,
                      }}>
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ padding: 16, color: 'var(--text-secondary)', fontSize: 14 }}>
                      {new Date(user.createdAt).toLocaleDateString('sr-Latn-RS')}
                    </td>
                    <td style={{ padding: 16 }}>
                      <button
                        onClick={() => onSelectUser(user.id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'var(--surface-elevated)',
                          border: '1px solid var(--border)',
                          borderRadius: 6,
                          color: 'var(--text)',
                          fontWeight: 500,
                          fontSize: 13,
                        }}
                      >
                        Uredi
                      </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Nema korisnika koji odgovaraju kriterijumima
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
