import { formatMoney } from '../utils/formatMoney.js';
import { categoryLabelFromPath } from '../utils/categoryLabel.js';

export function CartItem({ item, onQtyChange, onRemove }) {
  const subtotal = Number(item.precio) * item.cantidad;
  const category = categoryLabelFromPath(item.rutaCategoria);
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        {category ? (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-cart-badge">{category}</p>
        ) : null}
        <p className={`truncate font-sans font-semibold text-text-primary ${category ? 'mt-1' : ''}`}>{item.nombre}</p>
        <p className="mt-1 text-xs text-text-muted">{item.sku}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <span className="whitespace-nowrap">Qty</span>
          <input
            type="number"
            min={1}
            value={item.cantidad}
            onChange={(e) => {
              const raw = Number(e.target.value);
              const q = Number.isFinite(raw) ? Math.max(1, Math.floor(raw)) : 1;
              onQtyChange(item.id, q);
            }}
            className="w-20 rounded-xl border border-border-strong bg-page px-2 py-1.5 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
          />
        </label>
        <p className="min-w-[7rem] text-right text-sm font-bold text-text-primary">{formatMoney(subtotal)}</p>
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger transition hover:bg-danger/20"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
