import { Link } from 'react-router-dom';
import { formatMoney } from '../utils/formatMoney.js';

export function CheckoutForm({
  items,
  total,
  clienteId,
  onClienteIdChange,
  tipoEntrega,
  onTipoEntregaChange,
  paisEnvio,
  ciudadEnvio,
  direccionEnvio,
  onPaisEnvioChange,
  onCiudadEnvioChange,
  onDireccionEnvioChange,
  onSubmit,
  loading,
  error,
  submitLabel = 'Confirmar pedido',
  loadingLabel = 'Procesando…',
}) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-card">
        <h2 className="font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">Your cart is empty</h2>
        <p className="mt-2 text-text-secondary">Add items before checkout.</p>
        <Link to="/cart" className="mt-6 inline-flex rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground">
          View cart
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card lg:col-span-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">
          Carrito (impuestos, comisión y envío los calcula el servidor según destino)
        </h2>
        <ul className="mt-4 space-y-3">
          {items.map((p) => (
            <li key={p.id} className="flex justify-between gap-3 text-sm">
              <span className="min-w-0 text-text-secondary">
                <span className="font-medium text-text-primary">{p.nombre}</span>
                <span className="block text-xs text-text-muted">
                  SKU {p.sku} · cantidad {p.cantidad}
                </span>
              </span>
              <span className="shrink-0 font-medium tabular-nums text-text-primary">
                {formatMoney(Number(p.precio) * p.cantidad)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 border-t border-border pt-4">
          <p className="text-xs text-text-muted">Subtotal carrito (referencia; el total oficial lo devuelve el servidor tras impuestos, comisión y envío).</p>
          <p className="mt-2 flex justify-between text-base font-bold text-text-primary">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatMoney(total)}</span>
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-surface p-6 shadow-card lg:col-span-3">
        <h2 className="font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">Order details</h2>
        <p className="mt-1 text-sm text-text-secondary">
          En este paso solo se envía <code className="rounded bg-page px-1.5 py-0.5 text-xs">POST /orden</code>. El pago se confirma en el
          siguiente paso.
        </p>
        {error && (
          <div className="mt-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
        )}
        <div className="mt-6">
          <label className="text-sm font-medium text-text-primary">ID de cliente</label>
          <input
            className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
            value={clienteId}
            onChange={(e) => onClienteIdChange(e.target.value)}
            required
          />
          <p className="mt-1 text-xs text-text-muted">Debe coincidir con el usuario del JWT (<code className="text-[11px]">sub</code>) para ver el historial en «Mis pedidos».</p>
        </div>
        <fieldset className="mt-4">
          <legend className="text-sm font-medium text-text-primary">Tipo de entrega (HU-20)</legend>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-text-primary">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="tipoEntrega"
                checked={tipoEntrega === 'DOMICILIO'}
                onChange={() => onTipoEntregaChange('DOMICILIO')}
              />
              Domicilio
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="tipoEntrega"
                checked={tipoEntrega === 'RECOGIDA'}
                onChange={() => onTipoEntregaChange('RECOGIDA')}
              />
              Recogida en punto
            </label>
          </div>
        </fieldset>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-text-primary">Dirección de envío</label>
            <input
              className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
              value={direccionEnvio}
              onChange={(e) => onDireccionEnvioChange(e.target.value)}
              placeholder="Calle, número, apto."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary">País</label>
            <input
              className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
              value={paisEnvio}
              onChange={(e) => onPaisEnvioChange(e.target.value)}
              placeholder="Colombia"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary">Ciudad</label>
            <input
              className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
              value={ciudadEnvio}
              onChange={(e) => onCiudadEnvioChange(e.target.value)}
              placeholder="Bogotá (envío local) / Medellín (nacional CO)"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-success py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
        >
          {loading ? loadingLabel : submitLabel}
        </button>
      </form>
    </div>
  );
}
