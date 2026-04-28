import { useMemo } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useProductos } from '../hooks/useProductos.js';
import { formatMoney } from '../utils/formatMoney.js';

export function ProductoDetalle() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { productos, loading } = useProductos();

  const p = useMemo(() => {
    const fromState = location.state?.product;
    if (fromState && String(fromState.id) === String(id)) return fromState;
    return productos.find((x) => String(x.id) === String(id)) ?? null;
  }, [location.state, productos, id]);

  if (!loading && !p) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-card">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">Product not found</h1>
        <p className="mt-2 text-text-secondary">This item is not in the current catalog.</p>
        <Link to="/catalog" className="mt-6 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground">
          Back to catalog
        </Link>
      </div>
    );
  }

  if (!p) {
    return <p className="text-text-muted">Loading…</p>;
  }

  const topCat = String(p.rutaCategoria ?? '').split('/')[0] || 'General';

  return (
    <div>
      <nav className="mb-6 text-sm text-text-secondary">
        <Link to="/" className="transition hover:text-brand">
          Home
        </Link>
        <span className="mx-2 text-text-muted">/</span>
        <Link to="/catalog" className="transition hover:text-brand">
          Catalog
        </Link>
        <span className="mx-2 text-text-muted">/</span>
        <span className="text-text-primary">{p.nombre}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="aspect-square bg-gradient-to-br from-white/[0.07] to-transparent p-12 sm:p-16">
            <div className="flex h-full items-center justify-center font-display text-8xl font-normal text-white/[0.15]">
              {p.nombre?.charAt(0)}
            </div>
          </div>
        </div>
        <div>
          <span className="inline-block rounded-full border border-border bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
            {topCat}
          </span>
          <h1 className="mt-4 font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">{p.nombre}</h1>
          <p className="mt-4 text-lead text-text-secondary">{p.descripcion}</p>
          <p className="mt-6 text-3xl font-semibold text-text-primary">{formatMoney(p.precio)}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                addItem({ id: p.id, sku: `SKU-${p.id}`, nombre: p.nombre, precio: p.precio });
                navigate('/cart');
              }}
              className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
            >
              Add & view cart
            </button>
            <button
              type="button"
              onClick={() => addItem({ id: p.id, sku: `SKU-${p.id}`, nombre: p.nombre, precio: p.precio })}
              className="rounded-xl border border-border-strong px-6 py-3 text-sm font-semibold text-text-primary transition hover:border-brand"
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
