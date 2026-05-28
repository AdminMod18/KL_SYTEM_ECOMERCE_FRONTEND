import { useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { CheckoutForm } from '../components/CheckoutForm.jsx';
import { CheckoutPaymentPanel } from '../components/CheckoutPaymentPanel.jsx';
import { CheckoutStepper } from '../components/CheckoutStepper.jsx';
import { OrdenDesglosePanel } from '../components/OrdenDesglosePanel.jsx';
import { createOrden } from '../services/orderService.js';
import { saveCheckoutRecibo } from '../services/checkoutReciboStorage.js';
import {
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

export function Checkout() {
  const navigate = useNavigate();
  const { username, displayName, isAuthenticated } = useAuth();
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
        <CheckoutStepper current={2} />
        <div className="glass-panel rounded-2xl p-10 shadow-card">
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
        <CheckoutStepper current={2} />
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
        <CheckoutStepper current={2} />
        <div>
          <h1 className="mb-2 font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">Confirma el pago</h1>
          <p className="text-sm text-text-secondary">
            Tu pedido fue creado. Revisa el total oficial del servidor y elige cómo pagar.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-5">
          <aside className="glass-panel rounded-2xl p-6 shadow-card lg:col-span-2">
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
            <CheckoutPaymentPanel
              cardHolderName={displayName || username || 'Cliente'}
              total={orden.total}
              tipoPago={tipoPago}
              onTipoPagoChange={(next) => {
                setTipoPago(next);
                setPagoPrepError('');
              }}
              tokenPasarela={tokenPasarela}
              onTokenChange={(value) => {
                setTokenPasarela(value);
                setPagoPrepError('');
              }}
              prepError={pagoPrepError}
              onPay={handlePagar}
            />
            <div
              id="orden-creada-cart-warning"
              className="rounded-xl border border-cart-badge/40 bg-cart-badge/10 px-4 py-3 text-sm text-text-primary"
              role="status"
            >
              La orden ya fue creada. Cambios en el carrito no afectan esta orden.
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
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
      <CheckoutStepper current={1} />
      <h1 className="mb-2 font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">Verificar pedido</h1>
      <p className="mb-8 text-sm text-text-secondary">
        Revisa tu carrito y los datos de entrega. En el siguiente paso confirmarás el pago.
      </p>
      <CheckoutForm
        items={items}
        total={total}
        clienteId={clienteId}
        onClienteIdChange={setClienteId}
        clienteReadOnly={isAuthenticated && Boolean(username)}
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
        submitLabel="Crear pedido y continuar"
        loadingLabel="Creando pedido…"
      />
    </div>
  );
}
