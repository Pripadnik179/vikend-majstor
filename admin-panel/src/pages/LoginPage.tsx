import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška prilikom prijave');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--background)',
      padding: 20,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'var(--surface)',
        borderRadius: 16,
        padding: 32,
        border: '1px solid var(--border)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64,
            height: 64,
            backgroundColor: 'var(--primary)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 32,
          }}>
            🛠️
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            VikendMajstor Admin
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Prijavite se sa admin nalogom
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              padding: 12,
              backgroundColor: 'rgba(255, 68, 68, 0.1)',
              border: '1px solid var(--error)',
              borderRadius: 8,
              marginBottom: 16,
              color: 'var(--error)',
              fontSize: 14,
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 500,
            }}>
              Email adresa
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                fontSize: 16,
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              marginBottom: 8,
              fontSize: 14,
              fontWeight: 500,
            }}>
              Lozinka
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: 'var(--background)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                fontSize: 16,
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: isLoading ? 'var(--primary-dark)' : 'var(--primary)',
              color: 'var(--accent)',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Prijavljivanje...' : 'Prijavi se'}
          </button>
        </form>

        <div style={{
          marginTop: 24,
          paddingTop: 24,
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <a
            href="/"
            style={{
              color: 'var(--text-secondary)',
              fontSize: 14,
              textDecoration: 'underline',
            }}
          >
            Nazad na početnu stranicu
          </a>
        </div>
      </div>
    </div>
  );
}
