import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { clientDisplayName } from '../utils';

export default function ClientsList() {
  const { token } = useAuth();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await api.getClients(token, { search, status });
      setClients(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status]);

  return (
    <div>
      <div className="list-header">
        <div>
          <h1 style={{ fontSize: 26 }}>Clients</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, marginTop: 4 }}>
            {clients.length} fiche{clients.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/clients/new" className="btn btn-brass">+ Nouveau client</Link>
      </div>

      <div className="list-toolbar">
        <input
          placeholder="Rechercher (nom, entreprise, email, Instagram...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 6 }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 6 }}
        >
          <option value="">Tous statuts</option>
          <option value="prospect">Prospect</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 24, color: 'var(--ink-soft)' }}>Chargement...</div>
        ) : clients.length === 0 ? (
          <div style={{ padding: 24, color: 'var(--ink-soft)' }}>Aucun client pour l'instant.</div>
        ) : (
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: 12, color: 'var(--ink-soft)', borderBottom: '1px solid var(--line)' }}>
                  <th style={th}>Nom</th>
                  <th style={th}>Entreprise</th>
                  <th style={th}>Contact</th>
                  <th style={th}>Statut</th>
                  <th style={th}>Tags</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr
                    key={c.id}
                    style={{ borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                    onClick={() => (window.location.href = `/clients/${c.id}`)}
                  >
                    <td style={td}>
                      <Link to={`/clients/${c.id}`} style={{ color: 'var(--ink)', fontWeight: 500, textDecoration: 'none' }}>
                        {clientDisplayName(c)}
                      </Link>
                    </td>
                    <td style={td}>{c.company_name || '—'}</td>
                    <td style={td}>{c.email || c.phone || '—'}</td>
                    <td style={td}>
                      <span className={`status-pill status-${c.status}`}>{c.status}</span>
                    </td>
                    <td style={td}>
                      {(c.tags || []).map((t) => (
                        <span key={t} className="tag" style={{ marginRight: 4 }}>{t}</span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const th = { padding: '12px 16px', fontWeight: 500 };
const td = { padding: '12px 16px', fontSize: 14 };
