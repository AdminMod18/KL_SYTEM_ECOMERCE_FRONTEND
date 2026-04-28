import { Link } from 'react-router-dom';
import { formatMoney } from '../utils/formatMoney.js';
import { categoryLabelFromPath } from '../utils/categoryLabel.js';

export function ProductCard({ product, onAddToCart }) {
  const initial = product.nombre?.charAt(0) ?? '?';
  const category = categoryLabelFromPath(product.rutaCategoria);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card transition duration-200 hover:border-border-strong hover:shadow-card-hover">
      <Link to={`/product/${product.id}`} state={{ product }} className="block flex-1">
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-white/[0.06] to-transparent">
          <div className="absolute inset-0 flex items-center justify-center font-display text-5xl font-normal text-white/[0.12] transition group-hover:scale-105">
            {initial}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-page via-transparent to-transparent opacity-80" />
        </div>
        <div className="flex flex-1 flex-col p-5">
          {category ? (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-cart-badge">{category}</p>
          ) : null}
          <h2 className="font-sans text-lg font-semibold leading-snug tracking-tight text-text-primary group-hover:text-cart-badge">{product.nombre}</h2>
          <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{product.descripcion}</p>
          <p className="mt-4 text-base font-semibold text-text-primary">{formatMoney(product.precio)}</p>
        </div>
      </Link>
      <div className="border-t border-border px-5 pb-5">
        <button
          type="button"
          onClick={() =>
            onAddToCart({
              id: product.id,
              sku: `SKU-${product.id}`,
              nombre: product.nombre,
              precio: product.precio,
              rutaCategoria: product.rutaCategoria,
            })
          }
          className="mt-2 w-full rounded-xl border border-border-strong py-2.5 text-sm font-semibold text-text-primary transition hover:border-brand hover:bg-brand-soft"
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}
