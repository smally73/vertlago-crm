import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { CATEGORY_LABELS } from '../productCategories';

export default function ProductsList() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await api.getProducts(token, { search, category, status });
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, status]);

  return (
    <div>
      <div className="list-header">
        <div>
          <h1 style={{ fontSize: 26 }}>Produits</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, marginTop: 4 }}>
            {products.length} produit{products.length > 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/products/new" className="btn btn-brass">+ Nouveau produit</Link>
      </div>

      <div className="list-toolbar">
        <input
          placeholder="Rechercher (nom, référence...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 6 }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 6 }}
        >
          <option value="">Toutes catégories</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 6 }}
        >
          <option value="">Tous statuts</option>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 24, color: 'var(--ink-soft)' }}>Chargement...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: 24, color: 'var(--ink-soft)' }}>Aucun produit pour l'instant.</div>
        ) : (
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: 12, color: 'var(--ink-soft)', borderBottom: '1px solid var(--line)' }}>
                  <th style={th}>Nom</th>
                  <th style={th}>Référence</th>
                  <th style={th}>Catégorie</th>
                  <th style={th}>Prix</th>
                  <th style={th}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    style={{ borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                    onClick={() => (window.location.href = `/products/${p.id}`)}
                  >
                    <td style={td}>
                      <Link to={`/products/${p.id}`} style={{ color: 'var(--ink)', fontWeight: 500, textDecoration: 'none' }}>
                        {p.name}
                      </Link>
                    </td>
                    <td style={td}>{p.sku || '—'}</td>
                    <td style={td}>
                      <span className="tag">{CATEGORY_LABELS[p.category] || p.category}</span>
                    </td>
                    <td style={td}>
                      {p.default_price != null ? `${Number(p.default_price).toFixed(2)} ${p.default_currency}` : '—'}
                    </td>
                    <td style={td}>
                      <span className={`status-pill status-${p.status}`}>{p.status}</span>
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
