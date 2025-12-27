import React, { useState, useEffect } from 'react';
import './UsersPage.css';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  subscriptionTier: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  itemCount: number;
  bookingCount: number;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended'>('all');
  const [filterSubscription, setFilterSubscription] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspend = async (userId: number) => {
    if (!confirm('Da li ste sigurni da zelite da suspendirate ovog korisnika?')) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`${API_URL}/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to suspend user:', error);
    }
  };

  const handleActivate = async (userId: number) => {
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`${API_URL}/api/admin/users/${userId}/activate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to activate user:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                          (filterStatus === 'active' && user.isActive) ||
                          (filterStatus === 'suspended' && !user.isActive);
    const matchesSubscription = filterSubscription === 'all' || user.subscriptionTier === filterSubscription;
    return matchesSearch && matchesStatus && matchesSubscription;
  });

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Korisnici</h1>
        <p>Upravljanje korisnicima platforme</p>
      </div>

      <div className="filters-row">
        <input
          type="text"
          className="input search-input"
          placeholder="Pretrazi po imenu ili emailu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select 
          className="input filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
        >
          <option value="all">Svi statusi</option>
          <option value="active">Aktivni</option>
          <option value="suspended">Suspendovani</option>
        </select>
        <select 
          className="input filter-select"
          value={filterSubscription}
          onChange={(e) => setFilterSubscription(e.target.value)}
        >
          <option value="all">Sve pretplate</option>
          <option value="free">Besplatno</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
        </select>
        <button className="btn btn-secondary">Eksportuj CSV</button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Korisnik</th>
              <th>Pretplata</th>
              <th>Oglasi</th>
              <th>Rezervacije</th>
              <th>Status</th>
              <th>Registracija</th>
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
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                  Nema korisnika
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">{user.name?.charAt(0).toUpperCase() || 'U'}</div>
                      <div className="user-info">
                        <div className="user-name">{user.name || 'Nepoznato'}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${user.subscriptionTier === 'premium' ? 'warning' : user.subscriptionTier === 'standard' ? 'info' : 'secondary'}`}>
                      {user.subscriptionTier || 'free'}
                    </span>
                  </td>
                  <td>{user.itemCount || 0}</td>
                  <td>{user.bookingCount || 0}</td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}>
                      {user.isActive ? 'Aktivan' : 'Suspendovan'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('sr-RS')}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedUser(user)}>
                        Detalji
                      </button>
                      {user.isActive ? (
                        <button className="btn btn-danger btn-sm" onClick={() => handleSuspend(user.id)}>
                          Suspenduj
                        </button>
                      ) : (
                        <button className="btn btn-primary btn-sm" onClick={() => handleActivate(user.id)}>
                          Aktiviraj
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detalji korisnika</h3>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Ime:</span>
                <span className="detail-value">{selectedUser.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedUser.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Pretplata:</span>
                <span className="detail-value">{selectedUser.subscriptionTier}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Verifikovan:</span>
                <span className="detail-value">{selectedUser.isVerified ? 'Da' : 'Ne'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Broj oglasa:</span>
                <span className="detail-value">{selectedUser.itemCount}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Broj rezervacija:</span>
                <span className="detail-value">{selectedUser.bookingCount}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>Zatvori</button>
              <button className="btn btn-primary">Sacuvaj izmene</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
