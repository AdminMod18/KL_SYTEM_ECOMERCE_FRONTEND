import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ProductoComunidadPanel } from '../components/ProductoComunidadPanel.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useProductos } from '../hooks/useProductos.js';
import { formatMoney } from '../utils/formatMoney.js';

function imagenesProductoLista(p) {
  const raw = p?.imagenesUrls;
  if (raw == null || raw === '') return [];
  return String(raw)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ProductoDetalle() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { productos, loading } = useProductos();
  const [imagenIdx, setImagenIdx] = useState(0);

  useEffect(() => {
    setImagenIdx(0);
  }, [id]);

  const p = useMemo(() => {
    const fromState = location.state?.product;
    if (fromState && String(fromState.id) === String(id)) return fromState;
    return productos.find((x) => String(x.id) === String(id)) ?? null;
  }, [location.state, productos, id]);

  if (!loading && !p) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-card">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">Producto no encontrado</h1>
        <p className="mt-2 text-text-secondary">Este artículo no está en el catálogo actual.</p>
        <Link to="/catalog" className="mt-6 inline-block rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  if (!p) {
    return <p className="text-text-muted">Cargando…</p>;
  }

  const topCat = String(p.rutaCategoria ?? '').split('/')[0] || 'General';
  const imgs = imagenesProductoLista(p);
  const imagenPrincipal = imgs[imagenIdx] ?? imgs[0] ?? null;

  return (
    <div>
      <nav className="mb-6 text-sm text-text-secondary">
        <Link to="/" className="transition hover:text-brand">
          Inicio
        </Link>
        <span className="mx-2 text-text-muted">/</span>
        <Link to="/catalog" className="transition hover:text-brand">
          Catálogo
        </Link>
        <span className="mx-2 text-text-muted">/</span>
        <span className="text-text-primary">{p.nombre}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="aspect-square bg-gradient-to-br from-white/[0.07] to-transparent p-4 sm:p-6">
            {imagenPrincipal ? (
              <img
                src={imagenPrincipal}
                alt=""
                className="mx-auto h-full max-h-[min(420px,70vw)] w-full rounded-xl object-contain"
              />
            ) : (
              <div className="flex h-full min-h-[240px] items-center justify-center font-display text-8xl font-normal text-white/[0.15]">
                {p.nombre?.charAt(0)}
              </div>
            )}
          </div>
          {imgs.length > 1 ? (
            <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
              {imgs.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => setImagenIdx(i)}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    i === imagenIdx ? 'border-brand ring-2 ring-brand/25' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  aria-label={`Ver imagen ${i + 1}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <span className="inline-block rounded-full border border-border bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
            {topCat}
          </span>
          <h1 className="mt-4 font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">{p.nombre}</h1>
          <p className="mt-4 text-lead text-text-secondary">{p.descripcion}</p>
          <p className="mt-6 text-3xl font-semibold text-text-primary">{formatMoney(p.precio)}</p>
          <dl className="mt-6 grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
            {p.marca ? (
              <>
                <dt className="font-medium text-text-muted">Marca</dt>
                <dd>{p.marca}</dd>
              </>
            ) : null}
            {p.subcategoria ? (
              <>
                <dt className="font-medium text-text-muted">Subcategoría</dt>
                <dd>{p.subcategoria}</dd>
              </>
            ) : null}
            {p.originalidad ? (
              <>
                <dt className="font-medium text-text-muted">Original / Genérico</dt>
                <dd>{p.originalidad}</dd>
              </>
            ) : null}
            {p.condicion ? (
              <>
                <dt className="font-medium text-text-muted">Condición</dt>
                <dd>{p.condicion}</dd>
              </>
            ) : null}
            {p.cantidadStock != null ? (
              <>
                <dt className="font-medium text-text-muted">Cantidad</dt>
                <dd>{p.cantidadStock}</dd>
              </>
            ) : null}
            {[p.color, p.tamano, p.talla].some(Boolean) ? (
              <>
                <dt className="font-medium text-text-muted">Detalles</dt>
                <dd>{[p.color, p.tamano, p.talla].filter(Boolean).join(' · ') || '—'}</dd>
              </>
            ) : null}
            {p.pesoGramos != null ? (
              <>
                <dt className="font-medium text-text-muted">Peso (g)</dt>
                <dd>{p.pesoGramos}</dd>
              </>
            ) : null}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                addItem({ id: p.id, sku: `SKU-${p.id}`, nombre: p.nombre, precio: p.precio });
                navigate('/cart');
              }}
              className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
            >
              Añadir y ver carrito
            </button>
            <button
              type="button"
              onClick={() => addItem({ id: p.id, sku: `SKU-${p.id}`, nombre: p.nombre, precio: p.precio })}
              className="rounded-xl border border-border-strong px-6 py-3 text-sm font-semibold text-text-primary transition hover:border-brand"
            >
              Añadir al carrito
            </button>
          </div>
        </div>
      </div>

      <ProductoComunidadPanel productoId={p.id} vendedorSolicitudId={p.vendedorSolicitudId ?? null} />
    </div>
  );
}
