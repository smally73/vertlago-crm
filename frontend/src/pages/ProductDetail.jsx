import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import ProductForm from '../components/ProductForm';

export default function ProductDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.getProduct(token, id).then(setProduct).catch(() => setNotFound(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleUpdate(payload) {
    await api.updateProduct(token, id, payload);
    navigate('/products');
  }

  if (notFound) {
    return (
      <div>
        <p style={{ color: 'var(--ink-soft)' }}>Ce produit est introuvable.</p>
        <Link to="/products" className="btn btn-outline" style={{ marginTop: 12 }}>Retour à la liste</Link>
      </div>
    );
  }

  if (!product) return <p style={{ color: 'var(--ink-soft)' }}>Chargement...</p>;

  return (
    <div>
      <h1 style={{ fontSize: 26, marginBottom: 20 }}>Modifier le produit</h1>
      <ProductForm initial={product} onSubmit={handleUpdate} submitLabel="Enregistrer les modifications" />
    </div>
  );
}
