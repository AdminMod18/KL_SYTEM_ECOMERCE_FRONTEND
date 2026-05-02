/**
 * Convierte valores del API a texto seguro para React (evita objetos como hijos).
 * @param {unknown} value
 */
function displayText(value) {
  if (value == null) return '';
  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

/**
 * Resumen de POST /pagos exitoso.
 */
export function PagoExitoPanel({ pago, referenciaCliente }) {
  const esObjeto = pago != null && typeof pago === 'object' && !Array.isArray(pago);

  return (
    <div className="rounded-2xl border border-success/35 bg-surface p-6 shadow-card">
      <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-success">Pago exitoso</h3>

      {!esObjeto ? (
        <>
          <p className="mt-4 text-sm text-text-secondary">
            El cobro se registró correctamente. Si no ves el detalle del banco/pasarela, el servidor puede haber respondido sin cuerpo JSON.
          </p>
          {referenciaCliente ? (
            <p className="mt-4 text-xs text-text-muted">
              Referencia: <span className="font-mono text-text-secondary">{referenciaCliente}</span>
            </p>
          ) : null}
        </>
      ) : (
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-text-secondary">Estado</dt>
            <dd className="font-semibold text-text-primary">{displayText(pago.estado) || '—'}</dd>
          </div>
          {displayText(pago.mensaje) ? (
            <div>
              <dt className="text-text-secondary">Mensaje</dt>
              <dd className="mt-1 text-text-primary">{displayText(pago.mensaje)}</dd>
            </div>
          ) : null}
          {displayText(pago.tipo) ? (
            <div className="flex justify-between gap-3">
              <dt className="text-text-secondary">Tipo</dt>
              <dd className="font-medium text-text-primary">{displayText(pago.tipo)}</dd>
            </div>
          ) : null}
          {displayText(pago.idTransaccion) ? (
            <div className="flex justify-between gap-3 text-xs">
              <dt className="text-text-muted">Id transacción</dt>
              <dd className="font-mono text-text-secondary">{displayText(pago.idTransaccion)}</dd>
            </div>
          ) : null}
          {referenciaCliente ? (
            <div className="flex justify-between gap-3 text-xs">
              <dt className="text-text-muted">Referencia orden</dt>
              <dd className="font-mono text-text-secondary">{referenciaCliente}</dd>
            </div>
          ) : null}
        </dl>
      )}
    </div>
  );
}
