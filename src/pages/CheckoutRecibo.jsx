import { useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { OrdenDesglosePanel } from '../components/OrdenDesglosePanel.jsx';
import { PagoExitoPanel } from '../components/PagoExitoPanel.jsx';
import { clearCheckoutRecibo, readCheckoutRecibo, saveCheckoutRecibo } from '../services/checkoutReciboStorage.js';

/**
 * Lee recibo en el primer frame: primero el state del router, luego sessionStorage
 * (se escribe en Checkout antes de navegar — así no hay pantalla vacía hasta el effect).
 * @param {import('react-router-dom').Location} loc
 */
function loadReceiptSnapshot(loc) {
  const st = loc?.state;
  if (st && typeof st === 'object' && st.orden != null) {
    return st;
  }
  const stored = readCheckoutRecibo();
  if (stored && stored.orden != null) {
    return stored;
  }
  return null;
}

export function CheckoutRecibo() {
  const navigate = useNavigate();
  const location = useLocation();

  const datos = useMemo(() => loadReceiptSnapshot(location), [location]);

  useEffect(() => {
    const st = location.state;
    if (st && typeof st === 'object' && st.orden != null) {
      saveCheckoutRecibo({
        orden: st.orden,
        pago: st.pago,
        referenciaCliente: st.referenciaCliente ?? '',
      });
    }
  }, [location.state]);

  const orden = datos?.orden ?? null;
  const pago = datos?.pago ?? null;
  const referenciaCliente = datos?.referenciaCliente ?? '';

  function handleContinuar() {
    clearCheckoutRecibo();
    navigate('/', { replace: true });
  }

  if (!orden) {
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <h1 className="font-sans text-2xl font-bold text-text-primary">Sin recibo</h1>
        <p className="text-sm text-text-secondary">
          No hay datos de un pago reciente. Si acabas de pagar, vuelve al checkout o revisa tu historial en{' '}
          <Link to="/cuenta/pedidos" className="font-semibold text-cart-badge hover:underline">
            Mis pedidos
          </Link>
          .
        </p>
        <Link to="/checkout" className="inline-flex rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-black/90">
          Ir al checkout
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Pago completado</p>
        <h1 className="mt-2 font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">Recibo</h1>
        <p className="mt-2 text-sm text-text-secondary">Guarda esta referencia para cualquier consulta sobre tu compra.</p>
      </header>

      <PagoExitoPanel pago={pago} referenciaCliente={referenciaCliente} />

      <div className="rounded-2xl border border-border bg-success/5 px-5 py-4 text-sm text-text-primary">
        <p className="font-semibold text-text-primary">Pedido confirmado</p>
        <p className="mt-1 text-text-secondary">Desglose de la orden (order-service):</p>
      </div>

      <OrdenDesglosePanel orden={orden} />

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleContinuar}
          className="flex-1 rounded-xl bg-black py-3 text-sm font-semibold text-white transition hover:bg-black/90"
        >
          Volver al inicio
        </button>
        <Link
          to="/cuenta/pedidos"
          className="flex flex-1 items-center justify-center rounded-xl border border-border-strong py-3 text-center text-sm font-semibold text-text-primary transition hover:border-brand"
        >
          Ver mis pedidos
        </Link>
      </div>
    </div>
  );
}
