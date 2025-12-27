import React, { useState, useEffect } from 'react';
import './Dashboard.css';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalItems: number;
  activeItems: number;
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  newUsersToday: number;
  newItemsToday: number;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/api/admin/activity`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data.activities || []);
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    }
  };

  const statCards = [
    { label: 'Ukupno korisnika', value: stats?.totalUsers || 0, change: `+${stats?.newUsersToday || 0} danas`, positive: true },
    { label: 'Aktivni korisnici', value: stats?.activeUsers || 0, change: 'poslednjih 30 dana', positive: true },
    { label: 'Ukupno oglasa', value: stats?.totalItems || 0, change: `+${stats?.newItemsToday || 0} danas`, positive: true },
    { label: 'Aktivni oglasi', value: stats?.activeItems || 0, change: 'trenutno dostupno', positive: true },
    { label: 'Ukupno rezervacija', value: stats?.totalBookings || 0, change: `${stats?.pendingBookings || 0} na cekanju`, positive: true },
    { label: 'Mesecni prihod', value: `${stats?.monthlyRevenue || 0} RSD`, change: 'ovog meseca', positive: true },
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Pregled stanja platforme</p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-value">{isLoading ? '...' : stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            <div className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Poslednje aktivnosti</h3>
          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <p className="empty-state">Nema skorijih aktivnosti</p>
            ) : (
              recentActivity.slice(0, 10).map((activity, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-icon">{activity.icon || '📌'}</span>
                  <div className="activity-content">
                    <span className="activity-text">{activity.description}</span>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h3>Brze akcije</h3>
          <div className="quick-actions">
            <button className="btn btn-secondary">Pregled korisnika</button>
            <button className="btn btn-secondary">Moderacija oglasa</button>
            <button className="btn btn-secondary">Poslji obavestenje</button>
            <button className="btn btn-secondary">Eksportuj izvestaj</button>
          </div>
        </div>
      </div>
    </div>
  );
}
