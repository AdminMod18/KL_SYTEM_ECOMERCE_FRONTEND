import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export function Carrito() {
  const { items, removeItem, updateQty, total, clear } = useCart();

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 text-center">
        <h1 className="text-2xl font-semibold text-white">Tu carrito está vacío</h1>
        <p className="mt-2 text-slate-400">Explora el catálogo y añade productos.</p>
        <Link
          to="/catalogo"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Carrito</h1>
          <p className="text-sm text-slate-400">{items.length} línea(s)</p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          Vaciar
        </button>
      </div>
      <div className="space-y-3">
        {items.map((p) => (
          <div
            key={p.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-white">{p.nombre}</p>
              <p className="text-xs text-slate-500">{p.sku}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                Cantidad
                <input
                  type="number"
                  min={1}
                  className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                  value={p.cantidad}
                  onChange={(e) => updateQty(p.id, Number(e.target.value))}
                />
              </label>
              <p className="text-sm font-semibold text-indigo-300">
                {(Number(p.precio) * p.cantidad).toLocaleString('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  maximumFractionDigits: 0,
                })}
              </p>
              <button
                type="button"
                onClick={() => removeItem(p.id)}
                className="rounded-lg bg-rose-600/90 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-500"
              >
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-semibold text-white">
          Total:{' '}
          <span className="text-indigo-300">
            {total.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
          </span>
        </p>
        <Link
          to="/checkout"
          className="inline-flex justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Ir a checkout
        </Link>
      </div>
    </div>
  );
}
