import { useState } from 'react';
import { CATEGORY_LABELS, CURRENCIES } from '../productCategories';

const EMPTY = {
  name: '', sku: '', category: '', default_price: '', default_currency: 'EUR', status: 'actif',
};

export default function ProductForm({ initial, onSubmit, submitLabel = 'Enregistrer' }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...initial }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name || !form.category) {
      setError('Nom et catégorie sont requis.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        default_price: form.default_price === '' ? null : Number(form.default_price),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 28 }}>
      <Field label="Nom *">
        <input value={form.name} onChange={(e) => update('name', e.target.value)} />
      </Field>

      <Row>
        <Field label="Référence / SKU">
          <input value={form.sku} onChange={(e) => update('sku', e.target.value)} />
        </Field>
        <Field label="Catégorie *">
          <select value={form.category} onChange={(e) => update('category', e.target.value)}>
            <option value="">Choisir...</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </Field>
      </Row>

      <Row>
        <Field label="Prix unitaire par défaut">
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.default_price}
            onChange={(e) => update('default_price', e.target.value)}
          />
        </Field>
        <Field label="Devise par défaut">
          <select value={form.default_currency} onChange={(e) => update('default_currency', e.target.value)}>
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </Row>

      <Field label="Statut">
        <select value={form.status} onChange={(e) => update('status', e.target.value)}>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
        </select>
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
