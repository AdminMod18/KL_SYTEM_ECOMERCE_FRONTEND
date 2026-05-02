import { Link } from 'react-router-dom';

export function CuentaFavoritos() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary">
        Aquí aparecerán los productos que marques como favoritos cuando esa función esté conectada al catálogo.
      </p>
      <div className="rounded-2xl border border-dashed border-border bg-surface/80 px-6 py-16 text-center shadow-inner">
        <p className="text-sm font-medium text-text-primary">Aún no tienes favoritos guardados.</p>
        <p className="mt-2 text-sm text-text-muted">Explora el catálogo y vuelve para verlos aquí.</p>
        <Link
          to="/catalog"
          className="mt-6 inline-flex rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-black/90"
        >
          Ir al catálogo
        </Link>
      </div>
    </div>
  );
}
