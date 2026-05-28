import { Link } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';

export function CuentaFavoritos() {
  const { favorites } = useFavorites();
  const { addItem } = useCart();

  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary">
        Los productos que marques con el corazón en el catálogo o en la ficha del producto aparecerán aquí. Se guardan en este navegador para tu cuenta.
      </p>

      {favorites.length === 0 ? (
        <div className="glass-panel rounded-2xl border border-dashed border-border px-6 py-16 text-center shadow-inner">
          <p className="text-sm font-medium text-text-primary">Aún no tienes favoritos guardados.</p>
          <p className="mt-2 text-sm text-text-muted">Explora el catálogo y pulsa el corazón en las tarjetas para guardarlos.</p>
          <Link
            to="/catalog"
            className="premium-button mt-6 inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
          >
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {favorites.map((p) => (
            <ProductCard key={p.id} product={p} onAddToCart={addItem} />
          ))}
        </div>
      )}
    </div>
  );
}
