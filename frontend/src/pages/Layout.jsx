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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{
          width: 220,
          borderRight: '1px solid var(--line)',
          background: 'var(--surface)',
          padding: '24px 18px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--brass-dark)', fontWeight: 600 }}>
            VERTLAGO
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginTop: 2 }}>Back-office</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavItem to="/clients" label="Clients" />
          {/* Modules à venir : Commandes, Stocks, Contrôle de gestion */}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--line)' }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{user?.full_name}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 12 }}>{user?.role}</div>
          <button className="btn btn-outline" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center' }}>
            Se déconnecter
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: '32px 40px', maxWidth: 1100 }}>
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
