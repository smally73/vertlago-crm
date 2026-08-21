import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import ExpenseForm from '../components/ExpenseForm';

export default function ExpenseNew() {
  const { token } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(payload) {
    await api.createExpense(token, payload);
    navigate('/expenses');
  }

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 20 }}>Nouvelle dépense</h1>
      <ExpenseForm onSubmit={handleSubmit} submitLabel="Créer la dépense" />
    </div>
  );
}
