import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Receipt } from 'lucide-react';
import { CheckoutStepper } from '../components/CheckoutStepper.jsx';
import { OrdenDesglosePanel } from '../components/OrdenDesglosePanel.jsx';
import { PagoExitoPanel } from '../components/PagoExitoPanel.jsx';
import { clearCheckoutRecibo, readCheckoutRecibo, saveCheckoutRecibo } from '../services/checkoutReciboStorage.js';
import { formatMoney } from '../utils/formatMoney.js';

/**
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
  const [datos, setDatos] = useState(() => loadReceiptSnapshot(location));

  useEffect(() => {
    const snapshot = loadReceiptSnapshot(location);
    if (snapshot) {
      setDatos(snapshot);
      const st = location.state;
      if (st && typeof st === 'object' && st.orden != null) {
        saveCheckoutRecibo({
          orden: st.orden,
          pago: st.pago,
          referenciaCliente: st.referenciaCliente ?? '',
        });
      }
    }
  }, [location]);

  const orden = datos?.orden ?? null;
  const pago = datos?.pago ?? null;
  const referenciaCliente = datos?.referenciaCliente ?? '';

  function handleContinuar() {
    clearCheckoutRecibo();
    navigate('/', { replace: true });
  }

  if (!orden) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <CheckoutStepper current={2} />
        <div className="glass-panel rounded-2xl p-8 text-center shadow-card">
          <Receipt className="mx-auto h-12 w-12 text-text-muted" aria-hidden />
          <h1 className="mt-4 font-sans text-2xl font-bold text-text-primary">Sin recibo disponible</h1>
          <p className="mt-2 text-sm text-text-secondary">
            No encontramos un pago reciente. Si acabas de comprar, revisa{' '}
            <Link to="/cuenta/pedidos" className="font-semibold text-brand hover:underline">
              Mis pedidos
            </Link>
            .
          </p>
          <Link to="/checkout" className="premium-button mt-6 inline-flex rounded-xl px-6 py-3 text-sm font-semibold">
            Ir al checkout
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <CheckoutStepper current={2} pagoCompleto />

      <div className="glass-panel overflow-hidden rounded-2xl shadow-card">
        <div className="border-b border-emerald-500/25 bg-emerald-500/10 px-6 py-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle2 className="h-9 w-9 text-emerald-500" aria-hidden />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
            Pago completado
          </p>
          <h1 className="mt-2 font-sans text-2xl font-bold tracking-tight text-text-primary md:text-3xl">
            ¡Gracias por tu compra!
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Orden <span className="font-mono font-semibold text-text-primary">#{orden.ordenId}</span>
            {referenciaCliente ? (
              <>
                {' '}
                · Ref. <span className="font-mono">{referenciaCliente}</span>
              </>
            ) : null}
          </p>
          {orden.total != null ? (
            <p className="mt-4 font-sans text-3xl font-bold tabular-nums text-text-primary">
              {formatMoney(orden.total)}
            </p>
          ) : null}
        </div>

        <div className="space-y-6 p-6">
          <PagoExitoPanel pago={pago} referenciaCliente={referenciaCliente} />
          <OrdenDesglosePanel orden={orden} />

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleContinuar}
              className="premium-button flex-1 rounded-xl py-3 text-sm font-semibold"
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
      </div>
    </div>
  );
}
