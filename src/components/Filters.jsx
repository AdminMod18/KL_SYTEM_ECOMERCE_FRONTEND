import { useId } from 'react';

export function Filters({
  categories,
  selectedCategories,
  onToggleCategory,
  precioMin,
  precioMax,
  onPrecioMin,
  onPrecioMax,
  busqueda,
  onBusqueda,
}) {
  const idMin = useId();
  const idMax = useId();
  const idSearch = useId();

  return (
    <aside className="rounded-2xl border border-border bg-surface p-5 shadow-card lg:sticky lg:top-24">
      <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">Filters</h2>

      <div className="mt-5">
        <label htmlFor={idSearch} className="text-xs font-semibold uppercase tracking-wider text-text-muted">
          Search
        </label>
        <input
          id={idSearch}
          type="search"
          value={busqueda}
          onChange={(e) => onBusqueda(e.target.value)}
          placeholder="Name or description…"
          className="mt-2 w-full rounded-xl border border-border-strong bg-page px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition focus:border-brand focus:ring-2 focus:ring-brand/25"
        />
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Category</p>
        <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
          {categories.map((c) => {
            const checked = selectedCategories.includes(c);
            return (
              <li key={c}>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-text-secondary transition hover:bg-white/5">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleCategory(c)}
                    className="h-4 w-4 rounded border-border-strong bg-page text-brand focus:ring-brand"
                  />
                  <span>{c}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Price range</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={idMin} className="sr-only">
              Min
            </label>
            <input
              id={idMin}
              type="number"
              min={0}
              value={precioMin}
              onChange={(e) => onPrecioMin(Number(e.target.value))}
              className="w-full rounded-xl border border-border-strong bg-page px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
            />
          </div>
          <div>
            <label htmlFor={idMax} className="sr-only">
              Max
            </label>
            <input
              id={idMax}
              type="number"
              min={0}
              value={precioMax}
              onChange={(e) => onPrecioMax(Number(e.target.value))}
              className="w-full rounded-xl border border-border-strong bg-page px-3 py-2 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
