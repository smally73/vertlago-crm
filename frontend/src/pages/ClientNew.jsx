import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import ClientForm from '../components/ClientForm';

export default function ClientNew() {
  const { token } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(payload) {
    const client = await api.createClient(token, payload);
    navigate(`/clients/${client.id}`);
  }

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 20 }}>Nouveau client</h1>
      <ClientForm onSubmit={handleSubmit} submitLabel="Créer la fiche" />
    </div>
  );
}
