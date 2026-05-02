import { formatMoney } from '../utils/formatMoney.js';

/**
 * Desglose fiscal devuelto por order-service tras POST /orden.
 */
export function OrdenDesglosePanel({ orden }) {
  if (!orden) return null;

  const rows = [
    { label: 'Subtotal base', value: orden.subtotalBase },
    { label: 'IVA', value: orden.montoIva },
    { label: 'Comisión', value: orden.montoComision },
    { label: 'Envío', value: orden.montoEnvio },
  ];

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
      <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">Desglose (servidor)</h3>
      <dl className="mt-4 space-y-3">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex justify-between gap-4 text-sm">
            <dt className="text-text-secondary">{label}</dt>
            <dd className="font-medium tabular-nums text-text-primary">{formatMoney(value)}</dd>
          </div>
        ))}
        <div className="border-t border-border pt-3">
          <div className="flex justify-between gap-4 text-base font-bold text-text-primary">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatMoney(orden.total)}</dd>
          </div>
        </div>
      </dl>
      {orden.ordenId != null && (
        <p className="mt-4 text-xs text-text-muted">
          Orden <span className="font-mono text-text-secondary">#{orden.ordenId}</span>
          {orden.estado ? ` · ${orden.estado}` : ''}
          {orden.tipoEntrega ? ` · Entrega: ${orden.tipoEntrega}` : ''}
          {orden.ciudadEnvio || orden.paisEnvio ? (
            <>
              {' '}
              · Envío: {[orden.ciudadEnvio, orden.paisEnvio].filter(Boolean).join(', ')}
            </>
          ) : null}
        </p>
      )}
    </div>
  );
}
