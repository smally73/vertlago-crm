import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import ClientForm from '../components/ClientForm';

export default function ClientDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [editing, setEditing] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('note');

  async function load() {
    const data = await api.getClient(token, id);
    setClient(data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleUpdate(payload) {
    await api.updateClient(token, id, payload);
    setEditing(false);
    load();
  }

  async function handleDelete() {
    if (!window.confirm('Supprimer définitivement cette fiche client ?')) return;
    await api.deleteClient(token, id);
    navigate('/clients');
  }

  async function handleAddNote(e) {
    e.preventDefault();
    if (!noteContent.trim()) return;
    await api.addInteraction(token, id, { type: noteType, content: noteContent });
    setNoteContent('');
    load();
  }

  if (!client) return <p style={{ color: 'var(--ink-soft)' }}>Chargement...</p>;

  if (editing) {
    return (
      <div>
        <h1 style={{ fontSize: 26, marginBottom: 20 }}>Modifier {client.first_name} {client.last_name}</h1>
        <ClientForm initial={client} onSubmit={handleUpdate} submitLabel="Enregistrer les modifications" />
        <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => setEditing(false)}>
          Annuler
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26 }}>{client.first_name} {client.last_name}</h1>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className={`status-pill status-${client.status}`}>{client.status}</span>
            {(client.tags || []).map((t) => <span key={t} className="tag">{t}</span>)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-outline" onClick={() => setEditing(true)}>Modifier</button>
          <button className="btn btn-outline" style={{ color: 'var(--rust)' }} onClick={handleDelete}>Supprimer</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <div className="card" style={{ padding: 24, flex: 1 }}>
          <h3 style={{ fontSize: 15, marginBottom: 14, color: 'var(--ink-soft)' }}>Coordonnées</h3>
          <InfoRow label="Entreprise" value={client.company_name} />
          <InfoRow label="Email" value={client.email} />
          <InfoRow label="Téléphone" value={client.phone} />
          <InfoRow
            label="Adresse"
            value={[client.address_line1, client.address_line2, client.postal_code, client.city, client.country]
              .filter(Boolean)
              .join(', ')}
          />
          {client.notes && (
            <>
              <h3 style={{ fontSize: 15, margin: '18px 0 8px', color: 'var(--ink-soft)' }}>Notes</h3>
              <p style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{client.notes}</p>
            </>
          )}
        </div>

        <div className="card" style={{ padding: 24, flex: 1 }}>
          <h3 style={{ fontSize: 15, marginBottom: 14, color: 'var(--ink-soft)' }}>Journal d'interactions</h3>

          <form onSubmit={handleAddNote} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <select value={noteType} onChange={(e) => setNoteType(e.target.value)} style={{ padding: 8, border: '1px solid var(--line)', borderRadius: 6 }}>
                <option value="note">Note</option>
                <option value="appel">Appel</option>
                <option value="email">Email</option>
                <option value="reunion">Réunion</option>
              </select>
            </div>
            <textarea
              placeholder="Ajouter une interaction..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              style={{ width: '100%', padding: 9, border: '1px solid var(--line)', borderRadius: 6, minHeight: 60 }}
            />
            <button className="btn btn-outline" type="submit" style={{ marginTop: 8 }}>Ajouter</button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 360, overflowY: 'auto' }}>
            {client.interactions?.length ? (
              client.interactions.map((i) => (
                <div key={i.id} style={{ borderLeft: '2px solid var(--brass)', paddingLeft: 12 }}>
                  <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 2 }}>
                    {i.type} · {new Date(i.created_at).toLocaleString('fr-FR')}
                  </div>
                  <div style={{ fontSize: 14 }}>{i.content}</div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--ink-soft)', fontSize: 13.5 }}>Aucune interaction enregistrée.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, fontSize: 14, marginBottom: 8 }}>
      <span style={{ color: 'var(--ink-soft)', width: 90, flexShrink: 0 }}>{label}</span>
      <span>{value || '—'}</span>
    </div>
  );
}
