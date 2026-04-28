import { Link } from 'react-router-dom';
import { CartItem } from '../components/CartItem.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatMoney } from '../utils/formatMoney.js';

export function Carrito() {
  const { items, removeItem, updateQty, total, clear } = useCart();

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-12 text-center shadow-card">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">Your cart is empty</h1>
        <p className="mt-2 text-text-secondary">Explore the catalog and add products.</p>
        <Link
          to="/catalog"
          className="mt-8 inline-flex rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
        >
          Browse catalog
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">Cart</h1>
          <p className="mt-1 text-sm text-text-secondary">{items.length} item(s)</p>
        </div>
        <button
          type="button"
          onClick={clear}
          className="self-start rounded-xl border border-border-strong px-4 py-2 text-sm font-semibold text-text-secondary transition hover:border-danger hover:text-danger sm:self-auto"
        >
          Clear cart
        </button>
      </div>

      <div className="space-y-4">
        {items.map((p) => (
          <CartItem key={p.id} item={p} onQtyChange={updateQty} onRemove={removeItem} />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-bold text-text-primary">
          Total: <span className="text-brand">{formatMoney(total)}</span>
        </p>
        <Link
          to="/checkout"
          className="inline-flex justify-center rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
