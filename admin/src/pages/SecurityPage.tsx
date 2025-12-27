import React, { useState, useEffect } from 'react';
import './SecurityPage.css';

interface Report {
  id: number;
  type: 'user' | 'item' | 'message';
  reason: string;
  reportedBy: string;
  reportedEntity: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

interface AdminLog {
  id: number;
  adminName: string;
  action: string;
  target: string;
  timestamp: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export default function SecurityPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'logs'>('reports');

  useEffect(() => {
    fetchReports();
    fetchAdminLogs();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/api/admin/reports`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminLogs = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_URL}/api/admin/logs`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAdminLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch admin logs:', error);
    }
  };

  const handleResolveReport = async (reportId: number) => {
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`${API_URL}/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchReports();
    } catch (error) {
      console.error('Failed to resolve report:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'reviewed': return 'badge-info';
      case 'resolved': return 'badge-success';
      default: return '';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'user': return '👤';
      case 'item': return '🔧';
      case 'message': return '💬';
      default: return '📌';
    }
  };

  return (
    <div className="security-page">
      <div className="page-header">
        <h1>Sigurnost</h1>
        <p>Prijave, logovi i bezbednost platforme</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Prijave ({reports.filter(r => r.status === 'pending').length})
        </button>
        <button 
          className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          Admin logovi
        </button>
      </div>

      {activeTab === 'reports' && (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Tip</th>
                <th>Razlog</th>
                <th>Prijavio</th>
                <th>Prijavljeno</th>
                <th>Status</th>
                <th>Datum</th>
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
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                    Nema prijava
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <span className="type-icon">{getTypeBadge(report.type)}</span>
                    </td>
                    <td>{report.reason}</td>
                    <td>{report.reportedBy}</td>
                    <td>{report.reportedEntity}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(report.status)}`}>
                        {report.status === 'pending' ? 'Na cekanju' : report.status === 'reviewed' ? 'Pregledano' : 'Reseno'}
                      </span>
                    </td>
                    <td>{new Date(report.createdAt).toLocaleDateString('sr-RS')}</td>
                    <td>
                      {report.status !== 'resolved' && (
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleResolveReport(report.id)}
                        >
                          Resi
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

      {activeTab === 'logs' && (
        <div className="card">
          <div className="logs-list">
            {adminLogs.length === 0 ? (
              <p className="empty-state">Nema admin logova</p>
            ) : (
              adminLogs.map((log) => (
                <div key={log.id} className="log-item">
                  <div className="log-icon">📝</div>
                  <div className="log-content">
                    <div className="log-text">
                      <strong>{log.adminName}</strong> {log.action} <em>{log.target}</em>
                    </div>
                    <div className="log-time">
                      {new Date(log.timestamp).toLocaleString('sr-RS')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
