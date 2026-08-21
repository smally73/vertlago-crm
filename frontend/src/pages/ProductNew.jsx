import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import ProductForm from '../components/ProductForm';

export default function ProductNew() {
  const { token } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(payload) {
    const product = await api.createProduct(token, payload);
    navigate(`/products/${product.id}`);
  }

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 20 }}>Nouveau produit</h1>
      <ProductForm onSubmit={handleSubmit} submitLabel="Créer le produit" />
    </div>
  );
}
