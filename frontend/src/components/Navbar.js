import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navLinkStyle = (isActive) => ({
  textDecoration: 'none',
  padding: '6px 14px',
  borderRadius: '6px',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: isActive ? '#ffffff' : '#93c5fd',
  background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
  transition: 'all 0.15s',
});

const roleBadgeColor = {
  admin:             { bg: '#fef9c3', color: '#854d0e' },
  admission_officer: { bg: '#dcfce7', color: '#166534' },
  management:        { bg: '#f3e8ff', color: '#6b21a8' },
};

const roleLabels = {
  admin:             'Admin',
  admission_officer: 'Admission Officer',
  management:        'Management',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const badgeStyle = roleBadgeColor[user?.role] || {};

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)',
      padding: '0 24px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '8px',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem',
          }}>🎓</div>
          <span style={{
            fontFamily: 'Sora, sans-serif',
            fontWeight: 700,
            fontSize: '1rem',
            color: '#ffffff',
            letterSpacing: '-0.01em',
          }}>
            Admission CRM
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link to="/dashboard" style={navLinkStyle(isActive('/dashboard'))}>
            📊 Dashboard
          </Link>

          {(user?.role === 'admin' || user?.role === 'admission_officer') && (
            <>
              <Link to="/applicants" style={navLinkStyle(isActive('/applicants'))}>
                👤 Applicants
              </Link>
              <Link to="/admissions" style={navLinkStyle(isActive('/admissions'))}>
                🎟️ Admissions
              </Link>
            </>
          )}

          {user?.role === 'admin' && (
            <Link to="/masters" style={navLinkStyle(isActive('/masters'))}>
              ⚙️ Masters
            </Link>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: '0.85rem', color: '#bfdbfe' }}>
          {user?.name}
        </span>
        <span style={{
          ...badgeStyle,
          padding: '3px 10px',
          borderRadius: '999px',
          fontSize: '0.72rem',
          fontWeight: 600,
        }}>
          {roleLabels[user?.role]}
        </span>
        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(255,255,255,0.12)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.2)',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
