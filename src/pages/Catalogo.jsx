import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard.jsx';
import { Filters } from '../components/Filters.jsx';
import { useProductos } from '../hooks/useProductos.js';
import { useCart } from '../context/CartContext.jsx';
import { extractCategories, filterProductos } from '../services/catalog.js';
import { CATEGORIES } from '../data/marketplaceContent.js';

const SLUG_TO_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.title]));

export function Catalogo() {
  const [searchParams] = useSearchParams();
  const { productos, loading, error } = useProductos();
  const { addItem } = useCart();
  const categories = useMemo(() => extractCategories(productos), [productos]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(999999999);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat && SLUG_TO_LABEL[cat]) {
      const label = SLUG_TO_LABEL[cat];
      setSelectedCategories((prev) => (prev.includes(label) ? prev : [...prev, label]));
    }
  }, [searchParams]);

  const filtered = useMemo(
    () =>
      filterProductos(productos, {
        categorias: selectedCategories.length ? selectedCategories : null,
        precioMin,
        precioMax,
        busqueda,
      }),
    [productos, selectedCategories, precioMin, precioMax, busqueda],
  );

  function toggleCategory(c) {
    setSelectedCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  return (
    <div>
      <div className="mb-10 max-w-content">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">Catalog</h1>
        <p className="mt-3 text-lead text-text-secondary">Browse the full collection. Filter by category, price, or search.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-text-primary">{error}</div>
      )}

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
        <div className="w-full shrink-0 lg:max-w-xs">
          <Filters
            categories={categories}
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
            precioMin={precioMin}
            precioMax={precioMax}
            onPrecioMin={setPrecioMin}
            onPrecioMax={setPrecioMax}
            busqueda={busqueda}
            onBusqueda={setBusqueda}
          />
        </div>
        <div className="min-w-0 flex-1">
          {loading ? (
            <p className="text-sm text-text-muted">Loading…</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} onAddToCart={addItem} />
              ))}
            </div>
          )}
          {!loading && !filtered.length && (
            <p className="rounded-2xl border border-dashed border-border bg-surface-muted py-14 text-center text-sm text-text-muted">
              No products match your filters.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
