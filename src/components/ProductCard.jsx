import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FavoriteHeartButton } from './FavoriteHeartButton.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { formatMoney } from '../utils/formatMoney.js';
import { categoryLabelFromPath } from '../utils/categoryLabel.js';
import { favoriteSnapshotFromProduct } from '../utils/favoriteSnapshot.js';
import { parseImagenesUrlsCadena } from '../utils/imagenesUrls.js';
import { motion } from 'framer-motion';

function primeraImagenProducto(product) {
  const urls = parseImagenesUrlsCadena(product?.imagenesUrls);
  return urls[0] ?? null;
}

export function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const initial = product.nombre?.charAt(0) ?? '?';
  const category = categoryLabelFromPath(product.rutaCategoria);
  const img = primeraImagenProducto(product);
  const favSnap = favoriteSnapshotFromProduct(product);
  const favorite = isFavorite(product.id);

  function handleFavoritePress() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: location.pathname, search: location.search } } });
      return;
    }
    if (favSnap) toggleFavorite(favSnap);
  }

  return (
    <motion.article
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="group premium-card-hover flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface/85 shadow-card backdrop-blur-xl"
    >
      <div className="relative shrink-0">
        <Link to={`/product/${product.id}`} state={{ product }} className="block">
          <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-500/10 via-transparent to-violet-500/10">
            {img ? (
              <img src={img} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" loading="lazy" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center font-display text-5xl font-normal text-white/[0.12] transition group-hover:scale-105">
                {initial}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-900/10 to-transparent opacity-80" />
          </div>
        </Link>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end p-3">
          <div className="pointer-events-auto">
            <FavoriteHeartButton active={favorite} onPress={handleFavoritePress} />
          </div>
        </div>
      </div>

      <Link to={`/product/${product.id}`} state={{ product }} className="flex flex-1 flex-col p-5">
        {category ? (
          <p className="inline-flex w-fit rounded-full bg-blue-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
            {category}
          </p>
        ) : (
          <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">Sin categoría</p>
        )}
        <h2 className="mt-1 font-sans text-lg font-semibold leading-snug tracking-tight text-text-primary group-hover:text-cart-badge">
          {product.nombre}
        </h2>
        <p className="mt-4 text-base font-semibold text-text-primary">{formatMoney(product.precio)}</p>
      </Link>

      <div className="border-t border-border px-5 pb-5">
        <button
          type="button"
          onClick={() =>
            onAddToCart({
              id: product.id,
              sku: product.sku ?? `SKU-${product.id}`,
              nombre: product.nombre,
              precio: product.precio,
              rutaCategoria: product.rutaCategoria,
            })
          }
          className="mt-2 w-full rounded-xl border border-border-strong py-2.5 text-sm font-semibold text-text-primary transition hover:border-blue-500/40 hover:bg-blue-500/10"
        >
          Add to cart
        </button>
      </div>
    </motion.article>
  );
}
