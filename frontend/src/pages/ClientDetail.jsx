import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import ClientForm, { SOURCE_LABELS } from '../components/ClientForm';
import { clientDisplayName } from '../utils';

export default function ClientDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('note');
  const [editingInteractionId, setEditingInteractionId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editType, setEditType] = useState('note');

  async function load() {
    try {
      const data = await api.getClient(token, id);
      setClient(data);
    } catch {
      setNotFound(true);
    }
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

  function startEditInteraction(interaction) {
    setEditingInteractionId(interaction.id);
    setEditType(interaction.type);
    setEditContent(interaction.content);
  }

  async function handleSaveInteraction(interactionId) {
    if (!editContent.trim()) return;
    await api.updateInteraction(token, id, interactionId, { type: editType, content: editContent });
    setEditingInteractionId(null);
    load();
  }

  async function handleDeleteInteraction(interactionId) {
    if (!window.confirm('Supprimer définitivement cette interaction ?')) return;
    await api.deleteInteraction(token, id, interactionId);
    load();
  }

  if (notFound) {
    return (
      <div>
        <p style={{ color: 'var(--ink-soft)' }}>Cette fiche client est introuvable.</p>
        <Link to="/clients" className="btn btn-outline" style={{ marginTop: 12 }}>Retour à la liste</Link>
      </div>
    );
  }

  if (!client) return <p style={{ color: 'var(--ink-soft)' }}>Chargement...</p>;

  if (editing) {
    return (
      <div>
        <h1 style={{ fontSize: 26, marginBottom: 20 }}>Modifier {clientDisplayName(client)}</h1>
        <ClientForm initial={client} onSubmit={handleUpdate} submitLabel="Enregistrer les modifications" />
        <button className="btn btn-outline" style={{ marginTop: 12 }} onClick={() => setEditing(false)}>
          Annuler
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="detail-header">
        <div>
          <h1 style={{ fontSize: 26 }}>{clientDisplayName(client)}</h1>
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

      <div className="two-col">
        <div className="card" style={{ padding: 24, flex: 1 }}>
          <h3 style={{ fontSize: 15, marginBottom: 14, color: 'var(--ink-soft)' }}>Coordonnées</h3>
          <InfoRow label="Entreprise" value={client.company_name} />
          <InfoRow label="Email" value={client.email} />
          <InfoRow label="Téléphone" value={client.phone} />
          <InfoRow label="Instagram" value={client.instagram} />
          <InfoRow label="Rencontré via" value={client.source ? SOURCE_LABELS[client.source] : null} />
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
                  {editingInteractionId === i.id ? (
                    <>
                      <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value)}
                        style={{ padding: 6, border: '1px solid var(--line)', borderRadius: 6, marginBottom: 6 }}
                      >
                        <option value="note">Note</option>
                        <option value="appel">Appel</option>
                        <option value="email">Email</option>
                        <option value="reunion">Réunion</option>
                      </select>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        style={{ width: '100%', padding: 9, border: '1px solid var(--line)', borderRadius: 6, minHeight: 60 }}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                        <button className="btn btn-brass" onClick={() => handleSaveInteraction(i.id)}>Enregistrer</button>
                        <button className="btn btn-outline" onClick={() => setEditingInteractionId(null)}>Annuler</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{i.type} · {new Date(i.created_at).toLocaleString('fr-FR')}</span>
                        <span style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => startEditInteraction(i)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-soft)', fontSize: 12, padding: 0 }}
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteInteraction(i.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rust)', fontSize: 12, padding: 0 }}
                          >
                            Supprimer
                          </button>
                        </span>
                      </div>
                      <div style={{ fontSize: 14 }}>{i.content}</div>
                    </>
                  )}
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
