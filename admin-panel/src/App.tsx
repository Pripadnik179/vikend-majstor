import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import Sidebar from './components/Sidebar';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--background)',
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!user.isAdmin) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'var(--background)',
        padding: 20,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⛔</div>
        <h1 style={{ marginBottom: 8 }}>Pristup odbijen</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          Nemate administratorske privilegije za pristup ovom panelu.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '12px 24px',
            backgroundColor: 'var(--primary)',
            color: 'var(--accent)',
            borderRadius: 8,
            fontWeight: 600,
          }}
        >
          Nazad na početnu
        </button>
      </div>
    );
  }

  const handleNavigate = (page: string, userId?: string) => {
    setCurrentPage(page);
    if (userId) setSelectedUserId(userId);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'users':
        return <UsersPage onSelectUser={(id) => handleNavigate('user-detail', id)} />;
      case 'user-detail':
        return selectedUserId ? (
          <UserDetailPage userId={selectedUserId} onBack={() => setCurrentPage('users')} />
        ) : null;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
