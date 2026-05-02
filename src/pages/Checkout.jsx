import { useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { CheckoutForm } from '../components/CheckoutForm.jsx';
import { OrdenDesglosePanel } from '../components/OrdenDesglosePanel.jsx';
import { createOrden } from '../services/orderService.js';
import { saveCheckoutRecibo } from '../services/checkoutReciboStorage.js';
import {
  TOKEN_SIMULAR_RECHAZO,
  getMensajeFalloPago,
  pagarOrdenConsignacion,
  pagarOrdenOnline,
  referenciaClienteOrden,
} from '../services/paymentService.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { getRequestErrorMessage } from '../utils/apiError.js';
import { formatMoney } from '../utils/formatMoney.js';

/** Fases del checkout (orden y pago desacoplados). */
const CHECKOUT_PHASE = {
  IDLE: 'IDLE',
  ORDEN_CREADA: 'ORDEN_CREADA',
  PAGO_PROCESANDO: 'PAGO_PROCESANDO',
  PAGO_FALLIDO: 'PAGO_FALLIDO',
};

function buildLineasFromItems(items) {
  return items.map((p) => {
    const sku = (p.sku ?? `SKU-${p.id}`).trim();
    const cantidad = Math.max(1, Math.floor(Number(p.cantidad)) || 1);
    const precioUnitario = Number(p.precio);
    if (!sku) throw new Error('Cada línea debe tener SKU.');
    if (!Number.isFinite(precioUnitario) || precioUnitario < 0.01) {
      throw new Error('Precio unitario inválido en el carrito.');
    }
    return { sku, cantidad, precioUnitario };
  });
}

function StepIndicator({ phase }) {
  const pedidoListo = phase !== CHECKOUT_PHASE.IDLE;
  const pagoListo = false;
  const pasoActivo = phase === CHECKOUT_PHASE.IDLE ? 0 : 1;

  const steps = [
    { key: 'pedido', label: 'Pedido', done: pedidoListo, active: pasoActivo === 0 },
    { key: 'pago', label: 'Pago', done: pagoListo, active: pasoActivo === 1 },
  ];

  return (
    <ol className="mb-8 flex flex-wrap items-center gap-2 text-xs font-medium text-text-muted sm:gap-4">
      {steps.map((s, i) => {
        const ring = s.done ? 'border-success bg-success/15 text-success' : s.active ? 'border-brand bg-brand-soft text-brand' : 'border-border bg-surface text-text-muted';
        return (
          <li key={s.key} className="flex items-center gap-2 sm:gap-4">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] ${ring}`}>
              {s.done ? '✓' : i + 1}
            </span>
            <span className={s.active || s.done ? 'text-text-primary' : ''}>{s.label}</span>
            {i < steps.length - 1 ? <span className="hidden text-text-muted sm:inline">→</span> : null}
          </li>
        );
      })}
    </ol>
  );
}

export function Checkout() {
  const navigate = useNavigate();
  const { username } = useAuth();
  const { items, total, clear } = useCart();
  const [clienteId, setClienteId] = useState(() => username || 'cli-web-001');
  const [tipoEntrega, setTipoEntrega] = useState('DOMICILIO');
  const [paisEnvio, setPaisEnvio] = useState('Colombia');
  const [ciudadEnvio, setCiudadEnvio] = useState('Bogotá');
  const [direccionEnvio, setDireccionEnvio] = useState('');
  const [phase, setPhase] = useState(CHECKOUT_PHASE.IDLE);
  const [orden, setOrden] = useState(null);
  const [ordenError, setOrdenError] = useState('');
  const [pagoError, setPagoError] = useState('');
  const [isCreatingOrden, setIsCreatingOrden] = useState(false);
  const [tipoPago, setTipoPago] = useState('CONSIGNACION');
  const [tokenPasarela, setTokenPasarela] = useState('tok_demo_ok');
  const [pagoPrepError, setPagoPrepError] = useState('');

  useEffect(() => {
    if (username) setClienteId(username);
  }, [username]);

  const resetCheckoutLocal = useCallback(() => {
    setPhase(CHECKOUT_PHASE.IDLE);
    setOrden(null);
    setOrdenError('');
    setPagoError('');
    setTipoPago('CONSIGNACION');
    setTokenPasarela('tok_demo_ok');
    setPagoPrepError('');
  }, []);

  async function handleCrearOrden(e) {
    e.preventDefault();
    setOrdenError('');
    if (!items.length) {
      setOrdenError('El carrito está vacío.');
      return;
    }
    setIsCreatingOrden(true);
    try {
      const lineas = buildLineasFromItems(items);
      const nueva = await createOrden({
        clienteId,
        lineas,
        tipoEntrega,
        paisEnvio: paisEnvio.trim() || undefined,
        ciudadEnvio: ciudadEnvio.trim() || undefined,
        direccionEnvio: direccionEnvio.trim() || undefined,
      });
      setOrden(nueva);
      setPagoError('');
      setPhase(CHECKOUT_PHASE.ORDEN_CREADA);
    } catch (err) {
      setOrdenError(`Error al crear la orden: ${getRequestErrorMessage(err)}`);
    } finally {
      setIsCreatingOrden(false);
    }
  }

  async function handlePagar() {
    if (!orden) return;
    setPagoError('');
    setPagoPrepError('');
    if (tipoPago === 'ONLINE' && !String(tokenPasarela).trim()) {
      setPagoPrepError('El token de pasarela (tokenPasarela) es obligatorio para pagos ONLINE.');
      return;
    }
    setPhase(CHECKOUT_PHASE.PAGO_PROCESANDO);
    try {
      const pago =
        tipoPago === 'ONLINE'
          ? await pagarOrdenOnline(orden, tokenPasarela)
          : await pagarOrdenConsignacion(orden);
      const ref = referenciaClienteOrden(orden.ordenId);
      const payload = { orden, pago, referenciaCliente: ref };
      saveCheckoutRecibo(payload);
      flushSync(() => {
        navigate('/checkout/recibo', { replace: true, state: payload });
      });
      clear();
    } catch (err) {
      setPagoError(getMensajeFalloPago(err));
      setPhase(CHECKOUT_PHASE.PAGO_FALLIDO);
    }
  }

  if (phase === CHECKOUT_PHASE.PAGO_PROCESANDO) {
    return (
      <div className="mx-auto max-w-md space-y-6 text-center">
        <StepIndicator phase={phase} />
        <div className="rounded-2xl border border-border bg-surface p-10 shadow-card">
          <div
            className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent"
            aria-hidden
          />
          <p className="mt-6 font-sans text-lg font-semibold text-text-primary">Procesando pago</p>
          <p className="mt-2 text-sm text-text-secondary">
            Orden <span className="font-mono">#{orden?.ordenId}</span> · {tipoPago === 'ONLINE' ? 'ONLINE' : 'consignación'} · no cierres esta ventana.
          </p>
        </div>
      </div>
    );
  }

  if (phase === CHECKOUT_PHASE.PAGO_FALLIDO && orden) {
    const ref = referenciaClienteOrden(orden.ordenId);
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <StepIndicator phase={phase} />
        <div className="rounded-2xl border border-danger/40 bg-danger/10 px-5 py-4 text-sm text-danger">
          <p className="font-semibold">No se pudo completar el pago</p>
          <p className="mt-2 text-text-primary">{pagoError || 'Error desconocido.'}</p>
          <p className="mt-3 text-xs text-text-secondary">
            La orden <span className="font-mono">#{orden.ordenId}</span> ya está registrada. Referencia:{' '}
            <span className="font-mono">{ref}</span>
          </p>
        </div>
        <OrdenDesglosePanel orden={orden} />
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={handlePagar}
            className="flex-1 rounded-xl bg-success py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 sm:min-w-[140px]"
          >
            Reintentar pago
          </button>
          <button
            type="button"
            onClick={() => {
              setPagoError('');
              setPagoPrepError('');
              setPhase(CHECKOUT_PHASE.ORDEN_CREADA);
            }}
            className="flex-1 rounded-xl border border-border-strong py-3 text-sm font-semibold text-text-primary transition hover:border-brand sm:min-w-[140px]"
          >
            Cambiar método o token
          </button>
          <button
            type="button"
            onClick={() => {
              resetCheckoutLocal();
              navigate('/', { replace: true });
            }}
            className="w-full rounded-xl border border-border-strong py-3 text-sm font-semibold text-text-secondary transition hover:border-brand sm:w-auto sm:flex-1"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (phase === CHECKOUT_PHASE.ORDEN_CREADA && orden) {
    return (
      <div className="space-y-8">
        <StepIndicator phase={phase} />
        <div>
          <h1 className="mb-2 font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">Orden creada</h1>
          <p className="text-sm text-text-secondary">
            Revisa el desglose. El total oficial es el del servidor. Elige método de pago y confirma (
            <code className="text-xs">POST /pagos</code>
            ): consignación simulada u ONLINE con <code className="text-xs">tokenPasarela</code>.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-5">
          <aside className="rounded-2xl border border-border bg-surface p-6 shadow-card lg:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">Resumen del carrito</h2>
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
            <p className="mt-4 border-t border-border pt-4 text-xs text-text-muted">
              Subtotal carrito <span className="font-semibold text-text-primary">{formatMoney(total)}</span> (referencia).
            </p>
          </aside>
          <div className="space-y-6 lg:col-span-3">
            <OrdenDesglosePanel orden={orden} />
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">Método de pago (demo)</h3>
              <fieldset className="mt-4 space-y-3">
                <legend className="sr-only">Tipo de pago</legend>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 ${
                    tipoPago === 'CONSIGNACION' ? 'border-brand bg-brand-soft/30' : 'border-border bg-surface'
                  }`}
                >
                  <input
                    type="radio"
                    name="tipoPago"
                    checked={tipoPago === 'CONSIGNACION'}
                    onChange={() => {
                      setTipoPago('CONSIGNACION');
                      setPagoPrepError('');
                    }}
                    className="mt-1 text-brand"
                  />
                  <span>
                    <span className="font-medium text-text-primary">Consignación</span>
                    <span className="mt-0.5 block text-xs text-text-secondary">
                      Registro simulado con comprobante automático (<code className="text-[11px]">CONSIGNACION</code>).
                    </span>
                  </span>
                </label>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 ${
                    tipoPago === 'ONLINE' ? 'border-brand bg-brand-soft/30' : 'border-border bg-surface'
                  }`}
                >
                  <input
                    type="radio"
                    name="tipoPago"
                    checked={tipoPago === 'ONLINE'}
                    onChange={() => {
                      setTipoPago('ONLINE');
                      setPagoPrepError('');
                    }}
                    className="mt-1 text-brand"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="font-medium text-text-primary">Online (pasarela simulada)</span>
                    <span className="mt-0.5 block text-xs text-text-secondary">
                      Envía <code className="text-[11px]">tokenPasarela</code>. Para rechazo de demo usa{' '}
                      <code className="break-all text-[11px]">{TOKEN_SIMULAR_RECHAZO}</code>; cualquier otro valor suele autorizar.
                    </span>
                  </span>
                </label>
              </fieldset>
              {tipoPago === 'ONLINE' ? (
                <div className="mt-4">
                  <label htmlFor="tokenPasarela" className="text-sm font-medium text-text-primary">
                    Token pasarela
                  </label>
                  <input
                    id="tokenPasarela"
                    autoComplete="off"
                    value={tokenPasarela}
                    onChange={(e) => {
                      setTokenPasarela(e.target.value);
                      setPagoPrepError('');
                    }}
                    placeholder={TOKEN_SIMULAR_RECHAZO}
                    className="mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 font-mono text-sm focus:border-brand focus:ring-2 focus:ring-brand/25"
                  />
                </div>
              ) : null}
              {pagoPrepError ? (
                <p className="mt-3 text-sm text-danger" role="alert">
                  {pagoPrepError}
                </p>
              ) : null}
            </div>
            <div
              id="orden-creada-cart-warning"
              className="rounded-xl border border-cart-badge/40 bg-cart-badge/10 px-4 py-3 text-sm text-text-primary"
              role="status"
            >
              La orden ya fue creada. Cambios en el carrito no afectan esta orden.
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handlePagar}
                className="flex-1 rounded-xl bg-success py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
              >
                Pagar ahora
              </button>
              <span
                aria-describedby="orden-creada-cart-warning"
                className="flex flex-1 cursor-not-allowed select-none items-center justify-center rounded-xl border border-border bg-page py-3 text-center text-sm font-semibold text-text-muted opacity-70"
                title="La orden en curso no se actualiza si modificas el carrito."
              >
                Volver al carrito
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <StepIndicator phase={phase} />
      <h1 className="mb-2 font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">Checkout</h1>
      <p className="mb-8 text-sm text-text-secondary">
        Paso 1: <code className="text-xs">POST /orden</code> con el carrito. Paso 2: <code className="text-xs">POST /pagos</code> con monto =
        total de la orden y referencia <code className="text-xs">ORDEN-{'{id}'}</code>.
      </p>
      <CheckoutForm
        items={items}
        total={total}
        clienteId={clienteId}
        onClienteIdChange={setClienteId}
        tipoEntrega={tipoEntrega}
        onTipoEntregaChange={setTipoEntrega}
        paisEnvio={paisEnvio}
        ciudadEnvio={ciudadEnvio}
        direccionEnvio={direccionEnvio}
        onPaisEnvioChange={setPaisEnvio}
        onCiudadEnvioChange={setCiudadEnvio}
        onDireccionEnvioChange={setDireccionEnvio}
        onSubmit={handleCrearOrden}
        loading={isCreatingOrden}
        error={ordenError}
        submitLabel="Crear orden"
        loadingLabel="Creando orden…"
      />
    </div>
  );
}
