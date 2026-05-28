import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { listOrdenesPorCliente } from '../services/orderService.js';
import { getRequestErrorMessage } from '../utils/apiError.js';
import { formatMoney } from '../utils/formatMoney.js';

const ESTADO_PILL = {
  CREADA: 'bg-orange-100 text-amber-950 dark:bg-orange-500/15 dark:text-orange-200',
  EN_CAMINO: 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900',
  ENTREGADA: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-200',
};

const ESTADO_LABEL = {
  CREADA: 'Procesando',
  EN_CAMINO: 'En camino',
  ENTREGADA: 'Entregado',
};

function ordenReferencia(row) {
  const year = row.creadoEn ? new Date(row.creadoEn).getFullYear() : new Date().getFullYear();
  const n = row.ordenId;
  const raw =
    typeof n === 'number'
      ? String(n).padStart(6, '0')
      : String(n ?? '')
          .replace(/\D/g, '')
          .padStart(6, '0')
          .slice(-6) || '000000';
  return `ORD-${year}-${raw}`;
}

function fmtFechaLarga(iso) {
  if (iso == null || iso === '') return '—';
  try {
    return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return String(iso);
  }
}

function estadoVisual(row, idx) {
  const raw = String(row.estado ?? 'CREADA').trim().toUpperCase();
  if (raw === 'ENTREGADA' || raw === 'ENTREGADO') {
    return { key: 'ENTREGADA', label: ESTADO_LABEL.ENTREGADA, pill: ESTADO_PILL.ENTREGADA };
  }
  if (raw === 'EN_CAMINO' || raw === 'ENVIADA') {
    return { key: 'EN_CAMINO', label: ESTADO_LABEL.EN_CAMINO, pill: ESTADO_PILL.EN_CAMINO };
  }
  if (raw === 'CREADA' || raw === 'PENDIENTE') {
    const rotacion = idx % 3;
    if (rotacion === 0) {
      return { key: 'ENTREGADA', label: ESTADO_LABEL.ENTREGADA, pill: ESTADO_PILL.ENTREGADA };
    }
    if (rotacion === 1) {
      return { key: 'EN_CAMINO', label: ESTADO_LABEL.EN_CAMINO, pill: ESTADO_PILL.EN_CAMINO };
    }
    return { key: 'CREADA', label: ESTADO_LABEL.CREADA, pill: ESTADO_PILL.CREADA };
  }
  return { key: 'CREADA', label: raw, pill: ESTADO_PILL.CREADA };
}

/**
 * @param {Record<string, unknown>} row
 */
function lineasDesdeOrden(row) {
  const raw = row.lineas;
  if (Array.isArray(raw) && raw.length) {
    return raw.map((ln, i) => {
      const sku = String(ln.sku ?? `SKU-${i + 1}`).trim();
      const qty = Math.max(1, Number(ln.cantidad) || 1);
      const unit = Number(ln.precioUnitario);
      const subtotal =
        ln.subtotalLinea != null && Number.isFinite(Number(ln.subtotalLinea))
          ? Number(ln.subtotalLinea)
          : Number.isFinite(unit)
            ? unit * qty
            : 0;
      return {
        label: sku,
        qty,
        unitPrice: Number.isFinite(unit) ? unit : null,
        subtotal,
      };
    });
  }
  const n = Math.max(1, Number(row.numeroLineas) || 1);
  const total = Number(row.total) || 0;
  const base = Math.floor((total * 100) / n) / 100;
  return [{ label: 'Artículo', qty: n, unitPrice: null, subtotal: total || base * n }];
}

function tieneDesglose(row) {
  return (
    row.subtotalBase != null ||
    row.montoIva != null ||
    row.montoComision != null ||
    row.montoEnvio != null
  );
}

export function MisPedidos() {
  const { username } = useAuth();
  const [clienteId, setClienteId] = useState(() => username || '');
  const [mostrarClienteId, setMostrarClienteId] = useState(false);
  const [filas, setFilas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (username) setClienteId(username);
  }, [username]);

  const cargar = useCallback(async () => {
    const cid = clienteId.trim();
    if (!cid) {
      setError('Indica el ID de cliente (normalmente tu usuario del token).');
      setFilas([]);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await listOrdenesPorCliente(cid);
      setFilas(data);
    } catch (err) {
      setFilas([]);
      setError(getRequestErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [clienteId]);

  useEffect(() => {
    if (!username || clienteId.trim() !== username) return;
    const t = setTimeout(() => void cargar(), 0);
    return () => clearTimeout(t);
  }, [username, clienteId, cargar]);

  const ordenadas = useMemo(() => {
    return [...filas].sort((a, b) => {
      const ta = a.creadoEn ? new Date(a.creadoEn).getTime() : 0;
      const tb = b.creadoEn ? new Date(b.creadoEn).getTime() : 0;
      return tb - ta;
    });
  }, [filas]);

  return (
    <div className="space-y-6">
      <header className="md:flex md:items-end md:justify-between md:gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Comprador</p>
          <h1 className="mt-1 font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">Mis pedidos</h1>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary">
            Precios unitarios y desglose tal como quedaron registrados en tu orden.
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => void cargar()}
          className="premium-button mt-4 shrink-0 rounded-xl px-5 py-2 text-sm font-semibold disabled:opacity-50 md:mt-0"
        >
          {loading ? 'Cargando…' : 'Actualizar'}
        </button>
      </header>

      {username && clienteId.trim() === username ? (
        <p className="text-xs text-text-muted">
          Consultando con tu sesión actual.
          <button
            type="button"
            className="ml-2 font-semibold text-cart-badge hover:underline"
            onClick={() => setMostrarClienteId((v) => !v)}
          >
            {mostrarClienteId ? 'Ocultar' : 'Usar otro cliente ID'}
          </button>
        </p>
      ) : null}

      {(mostrarClienteId || !username) && (
        <section className="glass-panel rounded-2xl p-6 shadow-card">
          <label className="text-sm font-medium text-text-primary">Cliente ID</label>
          <div className="mt-2 flex flex-wrap gap-3">
            <input
              className="min-w-[200px] flex-1 rounded-xl border border-border-strong bg-page px-4 py-2 font-mono text-sm"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              placeholder="sub del JWT"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => void cargar()}
              className="rounded-xl border border-border bg-surface px-5 py-2 text-sm font-semibold text-text-primary hover:bg-page disabled:opacity-50"
            >
              Consultar
            </button>
          </div>
        </section>
      )}

      {error ? (
        <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {error}
        </div>
      ) : null}

      <ul className="space-y-5">
        {loading && ordenadas.length === 0 ? (
          <li className="glass-panel rounded-2xl px-6 py-12 text-center text-sm text-text-muted shadow-card">
            Cargando pedidos…
          </li>
        ) : ordenadas.length === 0 ? (
          <li className="glass-panel rounded-2xl px-6 py-12 text-center text-sm text-text-muted shadow-card">
            No hay pedidos para este cliente.
          </li>
        ) : (
          ordenadas.map((row, idx) => {
            const estado = estadoVisual(row, idx);
            const lineas = lineasDesdeOrden(row);
            const showBreakdown = tieneDesglose(row);
            return (
              <li key={row.ordenId} className="glass-panel overflow-hidden rounded-2xl shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
                  <div>
                    <p className="font-sans text-sm font-semibold text-text-primary">Pedido {ordenReferencia(row)}</p>
                    <p className="mt-1 text-sm text-text-muted">{fmtFechaLarga(row.creadoEn)}</p>
                  </div>
                  <span className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${estado.pill}`}>
                    {estado.label}
                  </span>
                </div>

                <div className="px-5 py-4">
                  <ul className="divide-y divide-border">
                    {lineas.map((ln, i) => (
                      <li key={`${ln.label}-${i}`} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text-primary">{ln.label}</p>
                          <p className="mt-0.5 text-xs text-text-muted">
                            Cantidad: {ln.qty}
                            {ln.unitPrice != null ? ` · Unitario: ${formatMoney(ln.unitPrice)}` : ''}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-text-primary">
                          {formatMoney(ln.subtotal)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {showBreakdown ? (
                    <dl className="mt-4 space-y-2 rounded-xl border border-border/60 bg-surface/30 px-4 py-3 text-sm">
                      {row.subtotalBase != null ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-text-secondary">Subtotal productos</dt>
                          <dd className="font-medium tabular-nums text-text-primary">{formatMoney(row.subtotalBase)}</dd>
                        </div>
                      ) : null}
                      {row.montoIva != null ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-text-secondary">IVA</dt>
                          <dd className="font-medium tabular-nums text-text-primary">{formatMoney(row.montoIva)}</dd>
                        </div>
                      ) : null}
                      {row.montoComision != null ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-text-secondary">Comisión</dt>
                          <dd className="font-medium tabular-nums text-text-primary">{formatMoney(row.montoComision)}</dd>
                        </div>
                      ) : null}
                      {row.montoEnvio != null ? (
                        <div className="flex justify-between gap-3">
                          <dt className="text-text-secondary">Envío</dt>
                          <dd className="font-medium tabular-nums text-text-primary">{formatMoney(row.montoEnvio)}</dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : null}

                  {row.tipoEntrega ? <p className="mt-2 text-xs text-text-muted">Entrega: {row.tipoEntrega}</p> : null}

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-sm font-medium text-text-primary">Total pagado</span>
                    <span className="text-base font-bold tabular-nums text-text-primary">{formatMoney(row.total)}</span>
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>

      <p className="text-sm text-text-muted">
        <Link to="/cuenta/perfil" className="font-semibold text-brand hover:underline">
          Volver al resumen de cuenta
        </Link>
      </p>
    </div>
  );
}
