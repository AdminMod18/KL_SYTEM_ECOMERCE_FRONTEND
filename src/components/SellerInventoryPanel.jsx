import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, RefreshCw, Search } from 'lucide-react';
import { listProductosPorVendedor, updateProductoStock } from '../services/productService.js';
import { formatMoney } from '../utils/formatMoney.js';
import { getRequestErrorMessage } from '../utils/apiError.js';

function stockBadge(stock) {
  const n = Number(stock) || 0;
  if (n <= 0) return 'border-red-400/50 bg-red-500/10 text-red-700 dark:text-red-300';
  if (n <= 3) return 'border-amber-400/50 bg-amber-500/10 text-amber-900 dark:text-amber-200';
  return 'border-emerald-400/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200';
}

function categoriaCorta(ruta) {
  const parts = String(ruta ?? '')
    .split('/')
    .filter((p) => p && p !== 'CATALOGO');
  return parts.slice(-2).join(' · ') || '—';
}

/**
 * @param {{ vendedorSolicitudId: number|string; onPublicarClick?: () => void; refreshKey?: number }} props
 */
export function SellerInventoryPanel({ vendedorSolicitudId, onPublicarClick, refreshKey = 0 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [stockDraft, setStockDraft] = useState({});
  const [savingId, setSavingId] = useState(null);

  const cargar = useCallback(async () => {
    if (vendedorSolicitudId == null) return;
    setError('');
    setLoading(true);
    try {
      const data = await listProductosPorVendedor(vendedorSolicitudId);
      setItems(data);
      const draft = {};
      for (const p of data) {
        draft[p.id] = String(p.cantidadStock ?? 0);
      }
      setStockDraft(draft);
    } catch (err) {
      setItems([]);
      setError(getRequestErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [vendedorSolicitudId]);

  useEffect(() => {
    void cargar();
  }, [cargar, refreshKey]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => {
      const blob = [p.nombre, p.marca, p.rutaCategoria, p.subcategoria, p.descripcion].filter(Boolean).join(' ').toLowerCase();
      return blob.includes(q);
    });
  }, [items, busqueda]);

  const stats = useMemo(() => {
    const totalProductos = items.length;
    const unidades = items.reduce((acc, p) => acc + (Number(p.cantidadStock) || 0), 0);
    const bajoStock = items.filter((p) => (Number(p.cantidadStock) || 0) <= 3).length;
    return { totalProductos, unidades, bajoStock };
  }, [items]);

  async function guardarStock(productoId) {
    const raw = stockDraft[productoId];
    const cantidadStock = Math.max(0, Math.trunc(Number(raw)));
    if (!Number.isFinite(cantidadStock)) {
      setError('Stock inválido.');
      return;
    }
    setSavingId(productoId);
    setError('');
    try {
      const actualizado = await updateProductoStock(productoId, {
        vendedorSolicitudId,
        cantidadStock,
      });
      setItems((prev) => prev.map((p) => (p.id === productoId ? { ...p, ...actualizado } : p)));
    } catch (err) {
      setError(getRequestErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  }

  function ajustarStock(productoId, delta) {
    const current = Math.max(0, Math.trunc(Number(stockDraft[productoId]) || 0));
    setStockDraft((prev) => ({ ...prev, [productoId]: String(current + delta) }));
  }

  return (
    <section className="glass-panel rounded-2xl p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
            <Package className="h-3.5 w-3.5" />
            Inventario
          </p>
          <h3 className="mt-1 font-sans text-lg font-semibold text-text-primary">Mis productos y stock</h3>
          <p className="mt-1 text-sm text-text-secondary">Consulta tu catálogo, ajusta unidades y revisa alertas de bajo stock.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => void cargar()}
            className="inline-flex items-center gap-2 rounded-xl border border-border-strong px-3 py-2 text-xs font-semibold text-text-primary hover:border-brand disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          {onPublicarClick ? (
            <button type="button" onClick={onPublicarClick} className="premium-button inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold">
              <Plus className="h-3.5 w-3.5" />
              Publicar producto
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-surface/40 px-4 py-3">
          <p className="text-xs text-text-muted">Productos</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-text-primary">{stats.totalProductos}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-surface/40 px-4 py-3">
          <p className="text-xs text-text-muted">Unidades en stock</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-text-primary">{stats.unidades}</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-surface/40 px-4 py-3">
          <p className="text-xs text-text-muted">Bajo stock (≤3)</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-text-primary">{stats.bajoStock}</p>
        </div>
      </div>

      <div className="relative mt-5">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, marca o categoría…"
          className="w-full rounded-xl border border-border-strong bg-page py-2.5 pl-10 pr-4 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
        />
      </div>

      {error ? (
        <p className="mt-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {loading && items.length === 0 ? (
        <p className="mt-6 text-center text-sm text-text-muted">Cargando inventario…</p>
      ) : filtrados.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border px-6 py-10 text-center">
          <p className="text-sm text-text-secondary">Aún no tienes productos publicados.</p>
          {onPublicarClick ? (
            <button type="button" onClick={onPublicarClick} className="premium-button mt-4 inline-flex px-5 py-2.5 text-sm font-semibold">
              Publicar tu primer producto
            </button>
          ) : null}
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-xl border border-border/60">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface/60 text-xs uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Precio</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtrados.map((p) => {
                const stock = Number(p.cantidadStock) || 0;
                return (
                  <tr key={p.id} className="bg-surface/20">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{p.nombre}</p>
                      <p className="text-xs text-text-muted">ID {p.id}</p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{categoriaCorta(p.rutaCategoria)}</td>
                    <td className="px-4 py-3 tabular-nums font-medium text-text-primary">{formatMoney(p.precio)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${stockBadge(stock)}`}>
                        {stock} uds.
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-border-strong px-2 py-1 text-xs font-semibold"
                          onClick={() => ajustarStock(p.id, -1)}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={0}
                          className="w-16 rounded-lg border border-border-strong bg-page px-2 py-1 text-center text-xs tabular-nums"
                          value={stockDraft[p.id] ?? stock}
                          onChange={(e) => setStockDraft((prev) => ({ ...prev, [p.id]: e.target.value }))}
                        />
                        <button
                          type="button"
                          className="rounded-lg border border-border-strong px-2 py-1 text-xs font-semibold"
                          onClick={() => ajustarStock(p.id, 1)}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          disabled={savingId === p.id}
                          onClick={() => void guardarStock(p.id)}
                          className="rounded-lg bg-brand px-2.5 py-1 text-xs font-semibold text-brand-foreground disabled:opacity-50"
                        >
                          {savingId === p.id ? '…' : 'Guardar'}
                        </button>
                        <Link to={`/product/${p.id}`} className="text-xs font-semibold text-brand hover:underline">
                          Ver
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
