import React, { useState, useEffect } from 'react';
import './SubscriptionsPage.css';

interface Subscription {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  tier: 'free' | 'standard' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  amount: number;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  activeSubscribers: number;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([
    { id: 'free', name: 'Besplatno', price: 0, features: ['5 oglasa', 'Osnovna podrska'], activeSubscribers: 0 },
    { id: 'standard', name: 'Standard', price: 499, features: ['15 oglasa', 'Prioritetna podrska', 'Statistika'], activeSubscribers: 0 },
    { id: 'premium', name: 'Premium', price: 999, features: ['Neograniceno oglasa', 'Premium podrska', 'Napredna analitika', 'Istaknuti oglasi'], activeSubscribers: 0 },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'plans'>('subscriptions');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/api/admin/subscriptions`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: number) => {
    if (!confirm('Da li ste sigurni da zelite da otkažete ovu pretplatu?')) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`${API_URL}/api/admin/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchSubscriptions();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'premium': return 'badge-warning';
      case 'standard': return 'badge-info';
      default: return 'badge-secondary';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'cancelled': return 'badge-error';
      case 'expired': return 'badge-secondary';
      default: return '';
    }
  };

  return (
    <div className="subscriptions-page">
      <div className="page-header">
        <h1>Pretplate</h1>
        <p>Upravljanje pretplatama i planovima</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          Pretplate
        </button>
        <button 
          className={`tab ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          Planovi
        </button>
      </div>

      {activeTab === 'subscriptions' && (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Korisnik</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Pocetak</th>
                <th>Kraj</th>
                <th>Iznos</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                    Ucitavanje...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                    Nema pretplata
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">{sub.userName?.charAt(0).toUpperCase() || 'U'}</div>
                        <div className="user-info">
                          <div className="user-name">{sub.userName}</div>
                          <div className="user-email">{sub.userEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getTierBadge(sub.tier)}`}>
                        {sub.tier}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(sub.status)}`}>
                        {sub.status === 'active' ? 'Aktivna' : sub.status === 'cancelled' ? 'Otkazana' : 'Istekla'}
                      </span>
                    </td>
                    <td>{new Date(sub.startDate).toLocaleDateString('sr-RS')}</td>
                    <td>{new Date(sub.endDate).toLocaleDateString('sr-RS')}</td>
                    <td>{sub.amount} RSD</td>
                    <td>
                      {sub.status === 'active' && (
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleCancelSubscription(sub.id)}
                        >
                          Otkazi
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="plans-grid">
          {plans.map((plan) => (
            <div key={plan.id} className={`plan-card ${plan.id === 'premium' ? 'featured' : ''}`}>
              <div className="plan-header">
                <h3>{plan.name}</h3>
                <div className="plan-price">
                  <span className="price-amount">{plan.price}</span>
                  <span className="price-period">RSD/mesec</span>
                </div>
              </div>
              <ul className="plan-features">
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <div className="plan-stats">
                <span>{plan.activeSubscribers} aktivnih pretplatnika</span>
              </div>
              <button className="btn btn-secondary">Uredi plan</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
