import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import UsersPage from './pages/UsersPage';
import ItemsPage from './pages/ItemsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SecurityPage from './pages/SecurityPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';

type Page = 'dashboard' | 'users' | 'items' | 'subscriptions' | 'analytics' | 'security' | 'settings';

function AppContent() {
  const { admin, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: 'var(--background)'
      }}>
        <div style={{ color: 'var(--text-secondary)' }}>Ucitavanje...</div>
      </div>
    );
  }

  if (!admin) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UsersPage />;
      case 'items':
        return <ItemsPage />;
      case 'subscriptions':
        return <SubscriptionsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'security':
        return <SecurityPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
