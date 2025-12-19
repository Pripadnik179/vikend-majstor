import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Korisnici', icon: '👥' },
  ];

  return (
    <aside style={{
      width: 260,
      backgroundColor: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: 16,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 8px',
        marginBottom: 24,
      }}>
        <div style={{
          width: 40,
          height: 40,
          backgroundColor: 'var(--primary)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
        }}>
          🛠️
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>VikendMajstor</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Admin Panel</div>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 8,
              marginBottom: 4,
              backgroundColor: currentPage === item.id ? 'var(--primary)' : 'transparent',
              color: currentPage === item.id ? 'var(--accent)' : 'var(--text)',
              fontWeight: currentPage === item.id ? 600 : 400,
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div style={{
        borderTop: '1px solid var(--border)',
        paddingTop: 16,
        marginTop: 16,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 0',
          marginBottom: 12,
        }}>
          <div style={{
            width: 36,
            height: 36,
            backgroundColor: 'var(--primary)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            color: 'var(--accent)',
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
          </div>
        </div>
        
        <button
          onClick={logout}
          style={{
            width: '100%',
            padding: '10px 16px',
            backgroundColor: 'transparent',
            border: '1px solid var(--error)',
            color: 'var(--error)',
            borderRadius: 8,
            fontWeight: 500,
            transition: 'all 0.2s',
          }}
        >
          Odjavi se
        </button>
      </div>
    </aside>
  );
}
