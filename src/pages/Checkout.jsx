import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckoutForm } from '../components/CheckoutForm.jsx';
import { api } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';

export function Checkout() {
  const navigate = useNavigate();
  const { items, total, clear } = useCart();
  const [clienteId, setClienteId] = useState('cli-web-001');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!items.length) {
      setError('Cart is empty.');
      return;
    }
    setLoading(true);
    try {
      const lineas = items.map((p) => ({
        sku: p.sku,
        cantidad: p.cantidad,
        precioUnitario: Number(p.precio),
      }));
      await api.post('/orden', {
        clienteId,
        lineas,
      });
      clear();
      navigate('/catalog');
    } catch (err) {
      const body = err.response?.data;
      const msg = body?.detail ?? body?.title ?? err.message ?? 'Could not place order.';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="mb-2 font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">Checkout</h1>
      <p className="mb-8 text-sm text-text-secondary">Review your bag and confirm.</p>
      <CheckoutForm
        items={items}
        total={total}
        clienteId={clienteId}
        onClienteIdChange={setClienteId}
        onSubmit={onSubmit}
        loading={loading}
        error={error}
      />
    </div>
  );
}
