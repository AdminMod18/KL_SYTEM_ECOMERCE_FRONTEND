import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { listOrdenesPorCliente } from '../services/orderService.js';
import { getRequestErrorMessage } from '../utils/apiError.js';
import { formatMoney } from '../utils/formatMoney.js';

const ESTADOS = [
  { label: 'Entregado', pill: 'bg-emerald-100 text-emerald-900' },
  { label: 'En camino', pill: 'bg-black text-white' },
  { label: 'Procesando', pill: 'bg-orange-100 text-amber-950' },
];

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

/** Reparte `total` en `numeroLineas` líneas para la vista cuando el API no envía ítems con nombre. */
function lineasDesdeTotales(total, numeroLineas) {
  const n = Math.max(1, Number(numeroLineas) || 1);
  const cents = Math.round(Number(total) * 100);
  if (Number.isNaN(cents)) {
    return [{ label: 'Artículo 1', qty: 1, subtotal: Number(total) || 0 }];
  }
  const base = Math.floor(cents / n);
  let rem = cents - base * n;
  const out = [];
  for (let i = 0; i < n; i++) {
    const c = base + (rem > 0 ? 1 : 0);
    if (rem > 0) rem -= 1;
    out.push({ label: `Artículo del pedido ${i + 1}`, qty: 1, subtotal: c / 100 });
  }
  return out;
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
            Historial según <code className="text-xs">GET /ordenes?clienteId=</code>. El estado mostrado es ilustrativo hasta que el API
            lo envíe.
          </p>
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={() => void cargar()}
          className="mt-4 shrink-0 rounded-xl bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-black/90 disabled:opacity-50 md:mt-0"
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
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <label className="text-sm font-medium text-text-primary">Cliente ID</label>
          <div className="mt-2 flex flex-wrap gap-3">
            <input
              className="min-w-[200px] flex-1 rounded-xl border border-border-strong bg-page px-4 py-2 text-sm font-mono"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              placeholder="sub del JWT"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => void cargar()}
              className="rounded-xl border border-border bg-white px-5 py-2 text-sm font-semibold text-text-primary hover:bg-page disabled:opacity-50"
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
          <li className="rounded-2xl border border-border bg-surface px-6 py-12 text-center text-sm text-text-muted shadow-card">
            Cargando pedidos…
          </li>
        ) : ordenadas.length === 0 ? (
          <li className="rounded-2xl border border-border bg-surface px-6 py-12 text-center text-sm text-text-muted shadow-card">
            No hay pedidos para este cliente.
          </li>
        ) : (
          ordenadas.map((row, idx) => {
            const estado = ESTADOS[idx % ESTADOS.length];
            const lineas = lineasDesdeTotales(row.total, row.numeroLineas);
            return (
              <li
                key={row.ordenId}
                className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
                  <div>
                    <p className="font-sans text-sm font-semibold text-text-primary">
                      Pedido {ordenReferencia(row)}
                    </p>
                    <p className="mt-1 text-sm text-text-muted">{fmtFechaLarga(row.creadoEn)}</p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${estado.pill}`}
                  >
                    {estado.label}
                  </span>
                </div>

                <div className="px-5 py-4">
                  <ul className="divide-y divide-border">
                    {lineas.map((ln, i) => (
                      <li key={i} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                        <span className="text-sm text-text-primary">
                          {ln.label} <span className="text-text-muted">× {ln.qty}</span>
                        </span>
                        <span className="shrink-0 text-sm tabular-nums font-medium text-text-primary">
                          {formatMoney(ln.subtotal)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {row.tipoEntrega ? (
                    <p className="mt-2 text-xs text-text-muted">Entrega: {row.tipoEntrega}</p>
                  ) : null}
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-sm font-medium text-text-primary">Total</span>
                    <span className="text-base font-bold tabular-nums text-text-primary">{formatMoney(row.total)}</span>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-text-primary hover:bg-page"
                    >
                      Ver detalles
                    </button>
                    <button
                      type="button"
                      className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-semibold text-text-primary hover:bg-page"
                    >
                      Rastrear pedido
                    </button>
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
