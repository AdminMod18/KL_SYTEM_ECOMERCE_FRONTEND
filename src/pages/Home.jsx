import { Link } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection.jsx';
import { CategoryCard } from '../components/CategoryCard.jsx';
import { ProductCard } from '../components/ProductCard.jsx';
import { TrustFeatureIcon } from '../components/TrustFeatureIcon.jsx';
import { CATEGORY_SECTION, CATEGORIES, FEATURED_SECTION, TRUST_SECTION } from '../data/marketplaceContent.js';
import { useProductos } from '../hooks/useProductos.js';
import { useCart } from '../context/CartContext.jsx';

export function Home() {
  const { productos, loading, error, reload } = useProductos();
  const { addItem } = useCart();
  const featured = productos.slice(0, 6);

  return (
    <div className="space-y-20 sm:space-y-28">
      <HeroSection />

      {error ? (
        <div className="mx-auto max-w-wide rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-text-primary">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => reload()}
            className="mt-2 text-sm font-semibold text-cart-badge underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      ) : null}

      <section>
        <div className="mx-auto max-w-content text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">{CATEGORY_SECTION.eyebrow}</p>
          <h2 className="mt-4 font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">{CATEGORY_SECTION.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lead text-text-secondary">{CATEGORY_SECTION.subtitle}</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-wide gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <CategoryCard key={c.slug} title={c.title} description={c.description} to={`/catalog?cat=${c.slug}`} />
          ))}
        </div>
      </section>

      <section>
        <div className="mx-auto flex max-w-wide flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-badge-text">{FEATURED_SECTION.eyebrow}</p>
            <h2 className="mt-3 font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">{FEATURED_SECTION.title}</h2>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center justify-center gap-1 self-center text-sm font-semibold text-text-primary transition hover:text-cart-badge sm:self-auto"
          >
            View all
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        {loading ? (
          <p className="mt-12 text-center text-sm text-text-muted">Cargando productos…</p>
        ) : featured.length ? (
          <div className="mx-auto mt-12 grid max-w-wide gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={addItem} />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-center text-sm text-text-muted">
            No hay productos destacados.{' '}
            <Link to="/catalog" className="font-semibold text-cart-badge hover:underline">
              Ver catálogo
            </Link>
          </p>
        )}
      </section>

      <section className="rounded-2xl bg-surface px-6 py-14 shadow-card sm:px-10 lg:px-14">
        <div className="mx-auto max-w-content text-center">
          <h2 className="font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
            {TRUST_SECTION.title}{' '}
            <span className="font-normal text-text-secondary">{TRUST_SECTION.titleAccent}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lead text-text-secondary">{TRUST_SECTION.subtitle}</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-wide gap-10 md:grid-cols-3 md:gap-8">
          {TRUST_SECTION.pillars.map((pillar) => (
            <div key={pillar.title} className="flex flex-col items-center text-center">
              <TrustFeatureIcon type={pillar.icon} />
              <h3 className="mt-5 font-sans text-lg font-semibold text-text-primary">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{pillar.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
