import { useMemo, useState } from 'react';
import { Building2, CreditCard, Lock, Sparkles } from 'lucide-react';
import { InteractiveCreditCard } from './InteractiveCreditCard.jsx';
import {
  cardBrandLabel,
  displayCardNumber,
  displayExpiry,
  formatCardNumber,
  formatExpiry,
} from '../utils/creditCardUi.js';
import { formatMoney } from '../utils/formatMoney.js';
import { TOKEN_SIMULAR_RECHAZO } from '../services/paymentService.js';

const PAYMENT_OPTIONS = [
  { value: 'ONLINE', label: 'Pago en línea', icon: CreditCard },
  { value: 'CONSIGNACION', label: 'Consignación', icon: Building2 },
];

const inputClass =
  'mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm text-text-primary focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20';

/**
 * Panel de pago del checkout con tarjeta interactiva (UI; contratos API sin cambios).
 */
export function CheckoutPaymentPanel({
  cardHolderName = 'TU NOMBRE',
  total = 0,
  tipoPago,
  onTipoPagoChange,
  tokenPasarela,
  onTokenChange,
  loading = false,
  prepError = '',
  onPay,
}) {
  const [cardNumber, setCardNumber] = useState('4242424242424242');
  const [expiry, setExpiry] = useState('12/28');
  const [flipped, setFlipped] = useState(false);

  const showCard = tipoPago === 'ONLINE';
  const brand = useMemo(() => cardBrandLabel(cardNumber), [cardNumber]);
  const holder = (cardHolderName || 'TU NOMBRE').toUpperCase().slice(0, 26);
  const cardNumberPreview = useMemo(() => displayCardNumber(cardNumber), [cardNumber]);
  const expiryPreview = useMemo(() => displayExpiry(expiry), [expiry]);

  function handleCardNumberChange(raw) {
    setCardNumber(String(raw ?? '').replace(/\D/g, '').slice(0, 16));
  }

  function handleExpiryChange(raw) {
    setExpiry(formatExpiry(raw));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onPay?.();
  }

  return (
    <section className="glass-panel overflow-hidden rounded-2xl shadow-card">
      <div className="border-b border-border/60 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              Pago
            </p>
            <h3 className="mt-1 font-sans text-lg font-semibold text-text-primary">Confirma tu pago</h3>
            <p className="mt-1 text-sm text-text-secondary">
              Elige el método y completa los datos. El cobro usa el total oficial de la orden.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-surface/50 px-4 py-3 text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Total a pagar</p>
            <p className="mt-1 font-sans text-2xl font-bold tabular-nums text-text-primary">{formatMoney(total)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 px-5 py-6 sm:px-6">
        <div>
          <p className="text-sm font-medium text-text-primary">Método de pago</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {PAYMENT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = tipoPago === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onTipoPagoChange(opt.value)}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                    active
                      ? 'border-blue-500/40 bg-blue-500/10 text-text-primary'
                      : 'border-border-strong bg-surface/30 text-text-secondary hover:border-blue-500/25'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {showCard ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
            <div className="flex justify-center lg:justify-start">
              <InteractiveCreditCard
                cardNumberPreview={cardNumberPreview}
                expiryPreview={expiryPreview}
                holder={holder}
                brand={brand}
                flipped={flipped}
                backTitle="Token pasarela"
                backValue={tokenPasarela || '••••••••'}
                securityNote="Pago seguro simulado para tu pedido"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-text-primary">Número de tarjeta</label>
                <input
                  className={`${inputClass} font-mono tracking-widest`}
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={formatCardNumber(cardNumber)}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  onFocus={() => setFlipped(false)}
                  placeholder="4242 4242 4242 4242"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-text-primary">Titular</label>
                  <input className={`${inputClass} uppercase`} value={holder} readOnly aria-readonly="true" />
                </div>
                <div>
                  <label className="text-sm font-medium text-text-primary">Vencimiento</label>
                  <input
                    className={`${inputClass} font-mono`}
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    value={expiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                    onFocus={() => setFlipped(false)}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="checkout-token-pasarela" className="text-sm font-medium text-text-primary">
                  Token de pasarela
                </label>
                <input
                  id="checkout-token-pasarela"
                  className={`${inputClass} font-mono`}
                  autoComplete="off"
                  value={tokenPasarela}
                  onChange={(e) => onTokenChange(e.target.value)}
                  onFocus={() => setFlipped(true)}
                  onBlur={() => setFlipped(false)}
                  placeholder={TOKEN_SIMULAR_RECHAZO}
                  required={tipoPago === 'ONLINE'}
                />
                <p className="mt-1 text-xs text-text-muted">
                  Prueba rechazo con <code className="text-[11px]">{TOKEN_SIMULAR_RECHAZO}</code>; cualquier otro valor suele autorizar.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 bg-surface/30 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-300">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-text-primary">Pago por consignación</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Se registrará un comprobante simulado automáticamente al confirmar (
                  <code className="text-[11px]">CONSIGNACION</code>).
                </p>
              </div>
            </div>
          </div>
        )}

        {prepError ? (
          <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
            {prepError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="premium-button inline-flex w-full items-center justify-center gap-2 bg-emerald-600 from-emerald-600 to-teal-600 shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 sm:w-auto"
        >
          <Lock className="h-4 w-4" />
          {loading ? 'Procesando pago…' : 'Pagar ahora'}
        </button>
      </form>
    </section>
  );
}
