import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import ExpenseForm from '../components/ExpenseForm';

export default function ExpenseDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.getExpense(token, id).then(setExpense).catch(() => setNotFound(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleUpdate(payload) {
    await api.updateExpense(token, id, payload);
    navigate('/expenses');
  }

  async function handleDelete() {
    if (!window.confirm('Supprimer définitivement cette dépense ?')) return;
    await api.deleteExpense(token, id);
    navigate('/expenses');
  }

  if (notFound) {
    return (
      <div>
        <p style={{ color: 'var(--ink-soft)' }}>Cette dépense est introuvable.</p>
        <Link to="/expenses" className="btn btn-outline" style={{ marginTop: 12 }}>Retour à la liste</Link>
      </div>
    );
  }

  if (!expense) return <p style={{ color: 'var(--ink-soft)' }}>Chargement...</p>;

  return (
    <div>
      <div className="detail-header">
        <h1 style={{ fontSize: 26 }}>Modifier la dépense</h1>
        <button className="btn btn-outline" style={{ color: 'var(--rust)' }} onClick={handleDelete}>
          Supprimer
        </button>
      </div>
      <ExpenseForm initial={expense} onSubmit={handleUpdate} submitLabel="Enregistrer les modifications" />
    </div>
  );
}
