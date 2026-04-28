import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
      setError('El carrito está vacío.');
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
      navigate('/catalogo');
    } catch (err) {
      const body = err.response?.data;
      const msg = body?.detail ?? body?.title ?? err.message ?? 'No se pudo crear la orden.';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
        <h1 className="text-2xl font-semibold text-white">Checkout</h1>
        <p className="mt-2 text-slate-400">No hay productos para pagar. Agrega ítems en el carrito.</p>
        <Link
          to="/carrito"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Ver carrito
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-2 text-2xl font-semibold text-white">Checkout</h1>
      <p className="mb-6 text-sm text-slate-400">
        Confirma el pedido. Se envía a <code className="rounded bg-slate-800 px-1">order-service</code> vía{' '}
        <code className="rounded bg-slate-800 px-1">POST /orden</code>.
      </p>
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        <p className="text-sm text-slate-400">Resumen</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-200">
          {items.map((p) => (
            <li key={p.id} className="flex justify-between gap-2">
              <span>
                {p.nombre} × {p.cantidad}
              </span>
              <span className="text-slate-400">
                {(Number(p.precio) * p.cantidad).toLocaleString('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  maximumFractionDigits: 0,
                })}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-right text-lg font-semibold text-indigo-300">
          Total:{' '}
          {total.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        {error && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {error}
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm text-slate-300">Cliente ID</label>
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
        >
          {loading ? 'Confirmando…' : 'Confirmar pedido'}
        </button>
      </form>
    </div>
  );
}
