import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh' }}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--brass-dark)', fontWeight: 600 }}>
            VERTLAGO
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginTop: 2 }}>Back-office</div>
        </div>

        <nav className="sidebar-nav">
          <NavItem to="/clients" label="Clients" />
          {/* Modules à venir : Commandes, Stocks, Contrôle de gestion */}
        </nav>

        <div className="sidebar-user">
          <div style={{ fontSize: 13, fontWeight: 500 }}>{user?.full_name}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 12 }}>{user?.role}</div>
          <button className="btn btn-outline sidebar-logout-btn" onClick={handleLogout}>
            Se déconnecter
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, label }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        padding: '9px 12px',
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 500,
        textDecoration: 'none',
        color: isActive ? 'var(--ink)' : 'var(--ink-soft)',
        background: isActive ? 'var(--sand)' : 'transparent',
      })}
    >
      {label}
    </NavLink>
  );
}
