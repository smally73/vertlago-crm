import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { CATEGORY_LABELS, CURRENCIES, PAYMENT_METHOD_LABELS } from '../expenseCategories';

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY = {
  amount: '', currency: 'EUR', expense_date: today(), beneficiary: '', reason: '', category: '', payment_method: '',
};

export default function ExpenseForm({ initial, onSubmit, submitLabel = 'Enregistrer' }) {
  const { token } = useAuth();
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    ...initial,
    expense_date: initial?.expense_date ? initial.expense_date.slice(0, 10) : today(),
  }));
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getExpenseBeneficiaries(token).then(setBeneficiaries).catch(() => {});
  }, [token]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.amount || !form.beneficiary || !form.category) {
      setError('Montant, bénéficiaire et typologie sont requis.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ ...form, amount: Number(form.amount) });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 28 }}>
      <Row>
        <Field label="Montant *">
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => update('amount', e.target.value)}
          />
        </Field>
        <Field label="Devise *">
          <select value={form.currency} onChange={(e) => update('currency', e.target.value)}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </Row>

      <Row>
        <Field label="Date">
          <input type="date" value={form.expense_date} onChange={(e) => update('expense_date', e.target.value)} />
        </Field>
        <Field label="Typologie *">
          <select value={form.category} onChange={(e) => update('category', e.target.value)}>
            <option value="">Choisir...</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
      </Row>

      <Field label="Modalité paiement">
        <select value={form.payment_method} onChange={(e) => update('payment_method', e.target.value)}>
          <option value="">Non renseigné</option>
          {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </Field>

      <Field label="Bénéficiaire *">
        <input
          list="beneficiaries-list"
          value={form.beneficiary}
          onChange={(e) => update('beneficiary', e.target.value)}
        />
        <datalist id="beneficiaries-list">
          {beneficiaries.map((b) => <option key={b} value={b} />)}
        </datalist>
      </Field>

      <Field label="Motif">
        <textarea value={form.reason} onChange={(e) => update('reason', e.target.value)} />
      </Field>

      {error && <p className="error-text">{error}</p>}

      <button className="btn btn-brass" type="submit" disabled={saving}>
        {saving ? 'Enregistrement...' : submitLabel}
      </button>
    </form>
  );
}

function Row({ children }) {
  return <div className="form-row">{children}</div>;
}

function Field({ label, children }) {
  return (
    <div className="field" style={{ flex: 1 }}>
      <label>{label}</label>
      {children}
    </div>
  );
}
