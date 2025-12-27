import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

type Page = 'dashboard' | 'users' | 'items' | 'subscriptions' | 'analytics' | 'security' | 'settings';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'users', label: 'Korisnici', icon: '👥' },
  { id: 'items', label: 'Oglasi', icon: '🔧' },
  { id: 'subscriptions', label: 'Pretplate', icon: '💳' },
  { id: 'analytics', label: 'Analitika', icon: '📈' },
  { id: 'security', label: 'Sigurnost', icon: '🔒' },
  { id: 'settings', label: 'Podesavanja', icon: '⚙️' },
];

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { admin, logout } = useAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🛠️</span>
            <span className="logo-text">VikendMajstor</span>
          </div>
          <div className="logo-subtitle">Admin Panel</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="admin-info">
            <div className="admin-avatar">
              {admin?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="admin-details">
              <div className="admin-name">{admin?.name || 'Admin'}</div>
              <div className="admin-role">{admin?.role || 'superadmin'}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            Odjavi se
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
