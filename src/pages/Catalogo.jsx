import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard.jsx';
import { Filters } from '../components/Filters.jsx';
import { useProductos } from '../hooks/useProductos.js';
import { useCart } from '../context/CartContext.jsx';
import { extractCategories, filterProductos } from '../services/catalog.js';
import { CATEGORIES } from '../data/marketplaceContent.js';
import { registrarEventoMetrica } from '../services/analyticsService.js';

const SLUG_TO_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.title]));

export function Catalogo() {
  const [searchParams] = useSearchParams();
  const { productos, loading, error, reload } = useProductos();
  const { addItem } = useCart();
  const categories = useMemo(() => extractCategories(productos), [productos]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(999999999);
  const [busqueda, setBusqueda] = useState('');
  const visitRegistered = useRef(false);

  useEffect(() => {
    if (visitRegistered.current) return;
    visitRegistered.current = true;
    void registrarEventoMetrica({ tipo: 'CONSULTA_CATALOGO', referencia: 'vista:catalogo' });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const q = busqueda.trim();
      if (!q) return;
      const cats = selectedCategories.length ? selectedCategories.join(',') : 'todas';
      void registrarEventoMetrica({
        tipo: 'CONSULTA_CATALOGO',
        referencia: `q:${q.slice(0, 80)}|cat:${cats.slice(0, 30)}`,
      });
    }, 700);
    return () => clearTimeout(t);
  }, [busqueda, selectedCategories]);

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
        <div
          className="mb-6 flex flex-col gap-3 rounded-xl border border-danger/30 bg-danger/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <p className="text-sm text-text-primary">{error}</p>
          <button
            type="button"
            onClick={() => reload()}
            className="shrink-0 rounded-full border border-border-strong bg-surface px-4 py-2 text-sm font-semibold text-text-primary transition hover:border-brand"
          >
            Reintentar
          </button>
        </div>
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
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Cargando catálogo">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
                >
                  <div className="aspect-[4/3] animate-pulse bg-page" />
                  <div className="space-y-3 p-5">
                    <div className="h-3 w-24 animate-pulse rounded bg-page" />
                    <div className="h-5 w-full animate-pulse rounded bg-page" />
                    <div className="h-5 w-2/3 animate-pulse rounded bg-page" />
                    <div className="h-6 w-20 animate-pulse rounded bg-page" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} onAddToCart={addItem} />
              ))}
            </div>
          )}
          {!loading && !error && !filtered.length && (
            <p className="rounded-2xl border border-dashed border-border bg-surface-muted py-14 text-center text-sm text-text-muted">
              No hay productos que coincidan con los filtros.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
