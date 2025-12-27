import React, { useState, useEffect } from 'react';
import './ItemsPage.css';

interface Item {
  id: number;
  title: string;
  description: string;
  pricePerDay: number;
  category: string;
  status: 'active' | 'pending' | 'rejected' | 'expired';
  ownerName: string;
  ownerEmail: string;
  views: number;
  bookings: number;
  createdAt: string;
  images: string[];
}

const API_URL = import.meta.env.VITE_API_URL || '';

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/api/admin/items`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (itemId: number) => {
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`${API_URL}/api/admin/items/${itemId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchItems();
    } catch (error) {
      console.error('Failed to approve item:', error);
    }
  };

  const handleReject = async (itemId: number) => {
    const reason = prompt('Razlog odbijanja:');
    if (!reason) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`${API_URL}/api/admin/items/${itemId}/reject`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      fetchItems();
    } catch (error) {
      console.error('Failed to reject item:', error);
    }
  };

  const handleDelete = async (itemId: number) => {
    if (!confirm('Da li ste sigurni da zelite da obrisete ovaj oglas?')) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`${API_URL}/api/admin/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'rejected': return 'badge-error';
      case 'expired': return 'badge-secondary';
      default: return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Aktivan';
      case 'pending': return 'Na cekanju';
      case 'rejected': return 'Odbijen';
      case 'expired': return 'Istekao';
      default: return status;
    }
  };

  return (
    <div className="items-page">
      <div className="page-header">
        <h1>Oglasi</h1>
        <p>Moderacija i upravljanje oglasima</p>
      </div>

      <div className="stats-row">
        <div className="mini-stat">
          <span className="mini-stat-value">{items.filter(i => i.status === 'pending').length}</span>
          <span className="mini-stat-label">Na cekanju</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-value">{items.filter(i => i.status === 'active').length}</span>
          <span className="mini-stat-label">Aktivni</span>
        </div>
        <div className="mini-stat">
          <span className="mini-stat-value">{items.filter(i => i.status === 'expired').length}</span>
          <span className="mini-stat-label">Istekli</span>
        </div>
      </div>

      <div className="filters-row">
        <input
          type="text"
          className="input search-input"
          placeholder="Pretrazi oglase..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select 
          className="input filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Svi statusi</option>
          <option value="pending">Na cekanju</option>
          <option value="active">Aktivni</option>
          <option value="rejected">Odbijeni</option>
          <option value="expired">Istekli</option>
        </select>
        <select 
          className="input filter-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">Sve kategorije</option>
          <option value="tools">Alati</option>
          <option value="garden">Basta</option>
          <option value="construction">Gradjevina</option>
          <option value="cleaning">Ciscenje</option>
        </select>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Oglas</th>
              <th>Vlasnik</th>
              <th>Cena/dan</th>
              <th>Pregledi</th>
              <th>Rezervacije</th>
              <th>Status</th>
              <th>Datum</th>
              <th>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                  Ucitavanje...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                  Nema oglasa
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="item-cell">
                      <div className="item-image">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt="" />
                        ) : (
                          <span>🔧</span>
                        )}
                      </div>
                      <div className="item-info">
                        <div className="item-title">{item.title}</div>
                        <div className="item-category">{item.category}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="owner-info">
                      <div>{item.ownerName}</div>
                      <div className="owner-email">{item.ownerEmail}</div>
                    </div>
                  </td>
                  <td>{item.pricePerDay} RSD</td>
                  <td>{item.views || 0}</td>
                  <td>{item.bookings || 0}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td>{new Date(item.createdAt).toLocaleDateString('sr-RS')}</td>
                  <td>
                    <div className="action-buttons">
                      {item.status === 'pending' && (
                        <>
                          <button className="btn btn-primary btn-sm" onClick={() => handleApprove(item.id)}>
                            Odobri
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleReject(item.id)}>
                            Odbij
                          </button>
                        </>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
                        Obrisi
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
