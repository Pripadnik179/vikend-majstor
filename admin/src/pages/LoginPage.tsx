import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password, showTwoFactor ? twoFactorCode : undefined);
    } catch (err: any) {
      if (err.message === '2FA_REQUIRED') {
        setShowTwoFactor(true);
      } else {
        setError(err.message || 'Prijava nije uspela');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🛠️</div>
          <h1>VikendMajstor</h1>
          <p>Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email adresa</label>
            <input
              type="email"
              id="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@vikendmajstor.rs"
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Lozinka</label>
            <input
              type="password"
              id="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          {showTwoFactor && (
            <div className="form-group">
              <label htmlFor="twoFactor">2FA Kod</label>
              <input
                type="text"
                id="twoFactor"
                className="input"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                disabled={isLoading}
              />
              <p className="form-hint">Unesite kod iz aplikacije za autentifikaciju</p>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Prijava u toku...' : 'Prijavi se'}
          </button>
        </form>

        <div className="login-footer">
          <p>Pristup je ogranicen samo za administratore.</p>
        </div>
      </div>
    </div>
  );
}
