import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { CATEGORY_LABELS, PAYMENT_METHOD_LABELS } from '../expenseCategories';

function periodDates(days) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return { date_from: from.toISOString().slice(0, 10), date_to: to.toISOString().slice(0, 10) };
}

export default function ExpensesList() {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [totals, setTotals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState(30);
  const [filters, setFilters] = useState(() => ({
    ...periodDates(30), beneficiary: '', amount_min: '', amount_max: '', category: '',
  }));

  function setPeriod(days) {
    setActivePeriod(days);
    setFilters((f) => ({ ...f, ...periodDates(days) }));
  }

  function updateFilter(field, value) {
    setActivePeriod(null);
    setFilters((f) => ({ ...f, [field]: value }));
  }

  async function load() {
    setLoading(true);
    try {
      const data = await api.getExpenses(token, filters);
      setExpenses(data.rows);
      setTotals(data.totals);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const totalsLabel = totals
    .map((t) => `${Number(t.total).toFixed(2)} ${t.currency}`)
    .join(' + ');

  return (
    <div>
      <div className="list-header">
        <div>
          <h1 style={{ fontSize: 26 }}>Dépenses</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 13.5, marginTop: 4 }}>
            {expenses.length} dépense{expenses.length > 1 ? 's' : ''}
            {totalsLabel && ` — Total : ${totalsLabel}`}
          </p>
        </div>
        <Link to="/expenses/new" className="btn btn-brass">+ Nouvelle dépense</Link>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          className={`btn ${activePeriod === 30 ? 'btn-brass' : 'btn-outline'}`}
          onClick={() => setPeriod(30)}
        >
          30 derniers jours
        </button>
        <button
          className={`btn ${activePeriod === 90 ? 'btn-brass' : 'btn-outline'}`}
          onClick={() => setPeriod(90)}
        >
          90 derniers jours
        </button>
      </div>

      <div className="list-toolbar" style={{ flexWrap: 'wrap' }}>
        <input
          type="date"
          value={filters.date_from}
          onChange={(e) => updateFilter('date_from', e.target.value)}
          style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 6 }}
        />
        <input
          type="date"
          value={filters.date_to}
          onChange={(e) => updateFilter('date_to', e.target.value)}
          style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 6 }}
        />
        <input
          placeholder="Bénéficiaire..."
          value={filters.beneficiary}
          onChange={(e) => updateFilter('beneficiary', e.target.value)}
          style={{ flex: 1, minWidth: 140, padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 6 }}
        />
        <input
          type="number"
          placeholder="Montant min"
          value={filters.amount_min}
          onChange={(e) => updateFilter('amount_min', e.target.value)}
          style={{ width: 110, padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 6 }}
        />
        <input
          type="number"
          placeholder="Montant max"
          value={filters.amount_max}
          onChange={(e) => updateFilter('amount_max', e.target.value)}
          style={{ width: 110, padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 6 }}
        />
        <select
          value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value)}
          style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: 6 }}
        >
          <option value="">Toutes typologies</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: 24, color: 'var(--ink-soft)' }}>Chargement...</div>
        ) : expenses.length === 0 ? (
          <div style={{ padding: 24, color: 'var(--ink-soft)' }}>Aucune dépense pour cette période/ces filtres.</div>
        ) : (
          <div className="table-scroll">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', fontSize: 12, color: 'var(--ink-soft)', borderBottom: '1px solid var(--line)' }}>
                  <th style={th}>Date</th>
                  <th style={th}>Bénéficiaire</th>
                  <th style={th}>Motif</th>
                  <th style={th}>Typologie</th>
                  <th style={th}>Modalité paiement</th>
                  <th style={th}>Montant</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr
                    key={e.id}
                    style={{ borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                    onClick={() => (window.location.href = `/expenses/${e.id}`)}
                  >
                    <td style={td}>{new Date(e.expense_date).toLocaleDateString('fr-FR')}</td>
                    <td style={td}>
                      <Link to={`/expenses/${e.id}`} style={{ color: 'var(--ink)', fontWeight: 500, textDecoration: 'none' }}>
                        {e.beneficiary}
                      </Link>
                    </td>
                    <td style={td}>{e.reason || '—'}</td>
                    <td style={td}>
                      <span className="tag">{CATEGORY_LABELS[e.category] || e.category}</span>
                    </td>
                    <td style={td}>{e.payment_method ? PAYMENT_METHOD_LABELS[e.payment_method] : '—'}</td>
                    <td style={td}>{Number(e.amount).toFixed(2)} {e.currency}</td>
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
