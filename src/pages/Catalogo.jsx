import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';

const MOCK_PRODUCTOS = [
  {
    id: 'm1',
    nombre: 'Auriculares ANC',
    precio: 129.99,
    descripcion: 'Demo local si el product-service no está arriba.',
    rutaCategoria: 'MOCK/Audio',
  },
  {
    id: 'm2',
    nombre: 'Teclado mecánico',
    precio: 89.5,
    descripcion: 'Producto de ejemplo para el carrito.',
    rutaCategoria: 'MOCK/Perifericos',
  },
];

export function Catalogo() {
  const { addItem } = useCart();
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get('/productos');
        if (!cancel) {
          const mapped = (Array.isArray(data) ? data : []).map((p) => ({
            id: String(p.id),
            nombre: p.nombre,
            precio: Number(p.precio),
            descripcion: p.descripcion,
            rutaCategoria: p.rutaCategoria,
          }));
          setProductos(mapped.length ? mapped : MOCK_PRODUCTOS);
        }
      } catch {
        if (!cancel) {
          setProductos(MOCK_PRODUCTOS);
          setError('No se pudo cargar el catálogo remoto; mostrando demo local.');
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Catálogo</h1>
          <p className="text-sm text-slate-400">Agrega productos al carrito.</p>
        </div>
      </div>
      {error && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {error}
        </div>
      )}
      {loading ? (
        <p className="text-slate-400">Cargando…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {productos.map((p) => (
            <article
              key={p.id}
              className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg"
            >
              <h2 className="text-lg font-semibold text-white">{p.nombre}</h2>
              <p className="mt-1 line-clamp-3 text-sm text-slate-400">{p.descripcion}</p>
              <p className="mt-2 text-xs text-slate-500">{p.rutaCategoria}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-lg font-bold text-indigo-300">
                  {p.precio.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    addItem({
                      id: p.id,
                      sku: `SKU-${p.id}`,
                      nombre: p.nombre,
                      precio: p.precio,
                    })
                  }
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                >
                  Añadir
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
