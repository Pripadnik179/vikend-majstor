import React, { useState, useEffect } from 'react';
import './AnalyticsPage.css';

interface AnalyticsData {
  dailyActiveUsers: number[];
  monthlyActiveUsers: number;
  registrations: number;
  conversions: {
    registered: number;
    addedItem: number;
    madeBooking: number;
    completed: number;
  };
  popularCategories: { name: string; count: number }[];
  topCities: { name: string; count: number }[];
  revenueByMonth: number[];
}

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/api/admin/analytics?range=${dateRange}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mockData: AnalyticsData = {
    dailyActiveUsers: [120, 145, 132, 168, 155, 189, 210],
    monthlyActiveUsers: 1250,
    registrations: 89,
    conversions: {
      registered: 100,
      addedItem: 45,
      madeBooking: 28,
      completed: 22,
    },
    popularCategories: [
      { name: 'Elektricni alati', count: 342 },
      { name: 'Bastenska oprema', count: 256 },
      { name: 'Gradjevinski alati', count: 198 },
      { name: 'Cistaci', count: 145 },
      { name: 'Meraci', count: 89 },
    ],
    topCities: [
      { name: 'Beograd', count: 456 },
      { name: 'Novi Sad', count: 234 },
      { name: 'Nis', count: 189 },
      { name: 'Kragujevac', count: 123 },
      { name: 'Subotica', count: 98 },
    ],
    revenueByMonth: [15000, 22000, 18000, 31000, 28000, 35000],
  };

  const displayData = data || mockData;

  const getConversionRate = (value: number, total: number) => {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  };

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div>
          <h1>Analitika</h1>
          <p>Pregled performansi platforme</p>
        </div>
        <div className="date-range-selector">
          <button 
            className={`range-btn ${dateRange === '7d' ? 'active' : ''}`}
            onClick={() => setDateRange('7d')}
          >
            7 dana
          </button>
          <button 
            className={`range-btn ${dateRange === '30d' ? 'active' : ''}`}
            onClick={() => setDateRange('30d')}
          >
            30 dana
          </button>
          <button 
            className={`range-btn ${dateRange === '90d' ? 'active' : ''}`}
            onClick={() => setDateRange('90d')}
          >
            90 dana
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{displayData.monthlyActiveUsers}</div>
          <div className="stat-label">Mesecno aktivni korisnici</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{displayData.registrations}</div>
          <div className="stat-label">Nove registracije</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{displayData.conversions.completed}</div>
          <div className="stat-label">Zavrsene transakcije</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{getConversionRate(displayData.conversions.completed, displayData.conversions.registered)}</div>
          <div className="stat-label">Stopa konverzije</div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="card funnel-card">
          <h3>Funnel analiza</h3>
          <div className="funnel">
            <div className="funnel-step">
              <div className="funnel-bar" style={{ width: '100%' }}>
                <span>{displayData.conversions.registered}</span>
              </div>
              <div className="funnel-label">Registrovani</div>
            </div>
            <div className="funnel-step">
              <div className="funnel-bar" style={{ width: `${(displayData.conversions.addedItem / displayData.conversions.registered) * 100}%` }}>
                <span>{displayData.conversions.addedItem}</span>
              </div>
              <div className="funnel-label">Dodali oglas</div>
            </div>
            <div className="funnel-step">
              <div className="funnel-bar" style={{ width: `${(displayData.conversions.madeBooking / displayData.conversions.registered) * 100}%` }}>
                <span>{displayData.conversions.madeBooking}</span>
              </div>
              <div className="funnel-label">Napravili rezervaciju</div>
            </div>
            <div className="funnel-step">
              <div className="funnel-bar success" style={{ width: `${(displayData.conversions.completed / displayData.conversions.registered) * 100}%` }}>
                <span>{displayData.conversions.completed}</span>
              </div>
              <div className="funnel-label">Zavrsili transakciju</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Popularne kategorije</h3>
          <div className="ranking-list">
            {displayData.popularCategories.map((cat, index) => (
              <div key={index} className="ranking-item">
                <span className="ranking-position">{index + 1}</span>
                <span className="ranking-name">{cat.name}</span>
                <span className="ranking-value">{cat.count} oglasa</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Najaktivniji gradovi</h3>
          <div className="ranking-list">
            {displayData.topCities.map((city, index) => (
              <div key={index} className="ranking-item">
                <span className="ranking-position">{index + 1}</span>
                <span className="ranking-name">{city.name}</span>
                <span className="ranking-value">{city.count} korisnika</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
