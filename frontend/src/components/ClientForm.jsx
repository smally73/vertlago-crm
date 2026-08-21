import { useState } from 'react';
import { COUNTRIES } from '../countries';

const EMPTY = {
  first_name: '', last_name: '', company_name: '', email: '', phone: '',
  address_line1: '', address_line2: '', postal_code: '', city: '', country: 'Italie',
  tags: '', notes: '', status: 'prospect', instagram: '', source: '',
};

export const SOURCE_LABELS = { salon: 'Salon', instagram: 'Instagram', mailing: 'Mailing', autre: 'Autre' };

export default function ClientForm({ initial, onSubmit, submitLabel = 'Enregistrer' }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    ...initial,
    tags: (initial?.tags || []).join(', '),
  }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.first_name && !form.last_name && !form.email && !form.instagram) {
      setError('Au moins un identifiant est requis : prénom/nom, email ou Instagram.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 28 }}>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 0, marginBottom: 20 }}>
        Renseigne au moins un identifiant : prénom/nom, email ou Instagram
        (un contact peut n'être connu que par l'un de ces trois).
      </p>

      <Row>
        <Field label="Prénom">
          <input value={form.first_name} onChange={(e) => update('first_name', e.target.value)} />
        </Field>
        <Field label="Nom">
          <input value={form.last_name} onChange={(e) => update('last_name', e.target.value)} />
        </Field>
      </Row>

      <Row>
        <Field label="Entreprise">
          <input value={form.company_name} onChange={(e) => update('company_name', e.target.value)} />
        </Field>
        <Field label="Statut">
          <select value={form.status} onChange={(e) => update('status', e.target.value)}>
            <option value="prospect">Prospect</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="archive">Archivé</option>
          </select>
        </Field>
      </Row>

      <Row>
        <Field label="Email">
          <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
        </Field>
        <Field label="Téléphone">
          <input value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        </Field>
      </Row>

      <Row>
        <Field label="Instagram">
          <input placeholder="@compte" value={form.instagram} onChange={(e) => update('instagram', e.target.value)} />
        </Field>
        <Field label="Rencontré via">
          <select value={form.source} onChange={(e) => update('source', e.target.value)}>
            <option value="">Non renseigné</option>
            <option value="salon">Salon</option>
            <option value="instagram">Instagram</option>
            <option value="mailing">Mailing</option>
            <option value="autre">Autre</option>
          </select>
        </Field>
      </Row>

      <Row>
        <Field label="Adresse">
          <input value={form.address_line1} onChange={(e) => update('address_line1', e.target.value)} />
        </Field>
        <Field label="Complément">
          <input value={form.address_line2} onChange={(e) => update('address_line2', e.target.value)} />
        </Field>
      </Row>

      <Row>
        <Field label="Code postal">
          <input value={form.postal_code} onChange={(e) => update('postal_code', e.target.value)} />
        </Field>
        <Field label="Ville">
          <input value={form.city} onChange={(e) => update('city', e.target.value)} />
        </Field>
        <Field label="Pays">
          <select value={form.country} onChange={(e) => update('country', e.target.value)}>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
      </Row>

      <Field label="Tags (séparés par des virgules)">
        <input
          placeholder="ex: grossiste, boutique, VIP"
          value={form.tags}
          onChange={(e) => update('tags', e.target.value)}
        />
      </Field>

      <Field label="Notes">
        <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} />
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
