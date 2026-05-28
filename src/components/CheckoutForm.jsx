import { Link } from 'react-router-dom';
import { MapPin, Package, Truck, User } from 'lucide-react';
import { formatMoney } from '../utils/formatMoney.js';

export function CheckoutForm({
  items,
  total,
  clienteId,
  onClienteIdChange,
  clienteReadOnly = false,
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
  submitLabel = 'Continuar al pago',
  loadingLabel = 'Creando pedido…',
}) {
  if (!items.length) {
    return (
      <div className="glass-panel rounded-2xl p-10 text-center shadow-card">
        <h2 className="font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">Tu carrito está vacío</h2>
        <p className="mt-2 text-text-secondary">Explora el catálogo y agrega productos antes de pagar.</p>
        <Link to="/cart" className="premium-button mt-8 inline-flex rounded-xl px-6 py-3 text-sm font-semibold">
          Ver carrito
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <aside className="glass-panel rounded-2xl p-6 shadow-card lg:col-span-2">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">
          <Package className="h-3.5 w-3.5" />
          Resumen
        </p>
        <h2 className="mt-2 font-sans text-lg font-semibold text-text-primary">Tu carrito</h2>
        <p className="mt-1 text-xs text-text-muted">Impuestos, comisión y envío se calculan al crear el pedido.</p>
        <ul className="mt-5 space-y-3">
          {items.map((p) => (
            <li key={p.id} className="flex justify-between gap-3 rounded-xl border border-border/60 bg-surface/30 px-3 py-3 text-sm">
              <span className="min-w-0 text-text-secondary">
                <span className="font-medium text-text-primary">{p.nombre}</span>
                <span className="mt-0.5 block text-xs text-text-muted">
                  SKU {p.sku} · ×{p.cantidad}
                </span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-text-primary">
                {formatMoney(Number(p.precio) * p.cantidad)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 border-t border-border pt-4">
          <p className="flex justify-between text-base font-bold text-text-primary">
            <span>Subtotal referencia</span>
            <span className="tabular-nums">{formatMoney(total)}</span>
          </p>
        </div>
      </aside>

      <form onSubmit={onSubmit} className="glass-panel rounded-2xl p-6 shadow-card lg:col-span-3">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">
          <MapPin className="h-3.5 w-3.5" />
          Entrega
        </p>
        <h2 className="mt-2 font-sans text-xl font-semibold text-text-primary md:text-2xl">Datos del pedido</h2>
        <p className="mt-1 text-sm text-text-secondary">Revisa la entrega y confirma para generar tu orden.</p>

        {error ? (
          <div className="mt-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
            {error}
          </div>
        ) : null}

        <fieldset className="mt-6 space-y-2">
          <legend className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <User className="h-4 w-4 text-text-muted" />
            Cliente
          </legend>
          {clienteReadOnly ? (
            <div className="mt-2 rounded-xl border border-border/60 bg-surface/40 px-4 py-3">
              <p className="text-sm font-semibold text-text-primary">{clienteId}</p>
              <p className="mt-1 text-xs text-text-muted">Vinculado a tu sesión para el historial en Mis pedidos.</p>
            </div>
          ) : (
            <>
              <input
                className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                value={clienteId}
                onChange={(e) => onClienteIdChange(e.target.value)}
                required
              />
              <p className="text-xs text-text-muted">Debe coincidir con tu usuario para ver el pedido después.</p>
            </>
          )}
        </fieldset>

        <fieldset className="mt-6">
          <legend className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <Truck className="h-4 w-4 text-text-muted" />
            Tipo de entrega
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              { value: 'DOMICILIO', label: 'Domicilio', hint: 'Envío a tu dirección' },
              { value: 'RECOGIDA', label: 'Recogida', hint: 'Punto de entrega' },
            ].map((opt) => {
              const active = tipoEntrega === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onTipoEntregaChange(opt.value)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    active
                      ? 'border-blue-500/40 bg-blue-500/10'
                      : 'border-border-strong bg-surface/30 hover:border-blue-500/25'
                  }`}
                >
                  <p className="text-sm font-semibold text-text-primary">{opt.label}</p>
                  <p className="mt-0.5 text-xs text-text-muted">{opt.hint}</p>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-text-primary">Dirección</label>
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
              placeholder="Bogotá, Medellín…"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="premium-button mt-8 w-full disabled:opacity-50 sm:w-auto">
          {loading ? loadingLabel : submitLabel}
        </button>
      </form>
    </div>
  );
}
