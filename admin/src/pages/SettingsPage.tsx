import React, { useState } from 'react';
import './SettingsPage.css';

interface FeatureToggle {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export default function SettingsPage() {
  const [features, setFeatures] = useState<FeatureToggle[]>([
    { id: 'registration', name: 'Registracija', description: 'Omoguci nove registracije korisnika', enabled: true },
    { id: 'bookings', name: 'Rezervacije', description: 'Omoguci kreiranje rezervacija', enabled: true },
    { id: 'messaging', name: 'Poruke', description: 'Omoguci slanje poruka izmedu korisnika', enabled: true },
    { id: 'reviews', name: 'Recenzije', description: 'Omoguci ostavljanje recenzija', enabled: true },
    { id: 'premium', name: 'Premium funkcije', description: 'Omoguci premium pretplate', enabled: true },
    { id: 'notifications', name: 'Push notifikacije', description: 'Slanje push notifikacija korisnicima', enabled: true },
  ]);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReport: false,
    securityAlerts: true,
  });

  const toggleFeature = (featureId: string) => {
    setFeatures(features.map(f => 
      f.id === featureId ? { ...f, enabled: !f.enabled } : f
    ));
  };

  const handleSendNotification = () => {
    const title = prompt('Naslov notifikacije:');
    if (!title) return;
    const message = prompt('Poruka:');
    if (!message) return;
    
    alert(`Notifikacija "${title}" ce biti poslata svim korisnicima.`);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Podesavanja</h1>
        <p>Konfiguracija platforme i funkcionalnosti</p>
      </div>

      <div className="settings-grid">
        <div className="card">
          <h3>Feature Toggles</h3>
          <p className="card-description">Ukljucite ili iskljucite funkcionalnosti platforme</p>
          
          <div className="toggles-list">
            {features.map((feature) => (
              <div key={feature.id} className="toggle-item">
                <div className="toggle-info">
                  <div className="toggle-name">{feature.name}</div>
                  <div className="toggle-description">{feature.description}</div>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={feature.enabled}
                    onChange={() => toggleFeature(feature.id)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Notifikacije</h3>
          <p className="card-description">Podesavanja admin notifikacija</p>
          
          <div className="toggles-list">
            <div className="toggle-item">
              <div className="toggle-info">
                <div className="toggle-name">Email notifikacije</div>
                <div className="toggle-description">Primaj email obavestenja o aktivnostima</div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={notificationSettings.emailNotifications}
                  onChange={() => setNotificationSettings(s => ({...s, emailNotifications: !s.emailNotifications}))}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="toggle-item">
              <div className="toggle-info">
                <div className="toggle-name">Push notifikacije</div>
                <div className="toggle-description">Primaj push obavestenja u pregledacu</div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={notificationSettings.pushNotifications}
                  onChange={() => setNotificationSettings(s => ({...s, pushNotifications: !s.pushNotifications}))}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="toggle-item">
              <div className="toggle-info">
                <div className="toggle-name">Nedelji izvestaj</div>
                <div className="toggle-description">Primaj nedelji email sa statistikom</div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={notificationSettings.weeklyReport}
                  onChange={() => setNotificationSettings(s => ({...s, weeklyReport: !s.weeklyReport}))}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="toggle-item">
              <div className="toggle-info">
                <div className="toggle-name">Sigurnosna upozorenja</div>
                <div className="toggle-description">Primaj obavestenja o sigurnosnim problemima</div>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={notificationSettings.securityAlerts}
                  onChange={() => setNotificationSettings(s => ({...s, securityAlerts: !s.securityAlerts}))}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Masovna obavestenja</h3>
          <p className="card-description">Posaljite notifikaciju svim korisnicima</p>
          
          <button className="btn btn-primary" onClick={handleSendNotification}>
            Posalji notifikaciju
          </button>
        </div>

        <div className="card">
          <h3>Informacije o sistemu</h3>
          <div className="system-info">
            <div className="info-row">
              <span className="info-label">Verzija aplikacije:</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-row">
              <span className="info-label">API verzija:</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-row">
              <span className="info-label">Baza podataka:</span>
              <span className="info-value badge badge-success">Online</span>
            </div>
            <div className="info-row">
              <span className="info-label">Server status:</span>
              <span className="info-value badge badge-success">Aktivan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
