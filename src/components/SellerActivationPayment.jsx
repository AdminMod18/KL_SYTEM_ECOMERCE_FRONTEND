import { useMemo, useState } from 'react';
import { Building2, CreditCard, Lock, Sparkles, Wallet } from 'lucide-react';
import { InteractiveCreditCard } from './InteractiveCreditCard.jsx';
import {
  cardBrandLabel,
  displayCardNumber,
  displayExpiry,
  formatCardNumber,
  formatExpiry,
} from '../utils/creditCardUi.js';

const PLAN_OPTIONS = [
  { value: 'MENSUAL', label: 'Mensual' },
  { value: 'SEMESTRAL', label: 'Semestral' },
  { value: 'ANUAL', label: 'Anual' },
];

const PAYMENT_OPTIONS = [
  { value: 'ONLINE', label: 'Pago en línea', icon: CreditCard },
  { value: 'TARJETA', label: 'Tarjeta', icon: Wallet },
  { value: 'CONSIGNACION', label: 'Consignación', icon: Building2 },
];

const inputClass =
  'mt-2 w-full rounded-xl border border-border-strong bg-page px-4 py-3 text-sm text-text-primary focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20';

/**
 * Panel de activación con tarjeta interactiva (solo UI; contratos API sin cambios).
 */
export function SellerActivationPayment({
  variant = 'activate',
  cardHolderName = 'TU NOMBRE',
  periodoSuscripcionPlan,
  onPeriodoChange,
  tipoActivacion,
  onTipoChange,
  montoActivacion,
  onMontoChange,
  tokenPasarela,
  onTokenChange,
  ultimosDigitosTarjetaActivacion,
  onUltimosDigitosChange,
  numeroComprobante,
  onNumeroComprobanteChange,
  loading = false,
  onSubmit,
}) {
  const isRenew = variant === 'renew';
  const title = isRenew ? 'Renovar suscripción' : 'Activar tu tienda';
  const subtitle = isRenew
    ? 'Tu tienda está en mora. Completa el pago para volver a publicar productos.'
    : 'Completa el pago para habilitar la publicación de productos.';
  const submitLabel = loading
    ? 'Procesando pago…'
    : isRenew
      ? 'Renovar suscripción'
      : 'Activar tienda';
  const eyebrow = isRenew ? 'Renovación' : 'Activación';

  const [cardNumber, setCardNumber] = useState(() => {
    const last4 = String(ultimosDigitosTarjetaActivacion ?? '').replace(/\D/g, '').slice(-4);
    return last4 ? `424242424242${last4}`.slice(-16) : '4242424242424242';
  });
  const [expiry, setExpiry] = useState('12/28');
  const [flipped, setFlipped] = useState(false);

  const showCard = tipoActivacion === 'ONLINE' || tipoActivacion === 'TARJETA';
  const brand = useMemo(() => cardBrandLabel(cardNumber), [cardNumber]);
  const holder = (cardHolderName || 'TU NOMBRE').toUpperCase().slice(0, 26);
  const cardNumberPreview = useMemo(() => displayCardNumber(cardNumber), [cardNumber]);
  const expiryPreview = useMemo(() => displayExpiry(expiry), [expiry]);

  function handleCardNumberChange(raw) {
    const digits = String(raw ?? '').replace(/\D/g, '').slice(0, 16);
    setCardNumber(digits);
    if (tipoActivacion === 'TARJETA') {
      onUltimosDigitosChange(digits.slice(-4));
    }
  }

  function handleExpiryChange(raw) {
    setExpiry(formatExpiry(raw));
  }

  function handleTipoChange(next) {
    onTipoChange(next);
    if (next === 'TARJETA') {
      const digits = cardNumber.replace(/\D/g, '');
      onUltimosDigitosChange(digits.slice(-4) || ultimosDigitosTarjetaActivacion);
    }
  }

  return (
    <section className="glass-panel overflow-hidden rounded-2xl shadow-card">
      <div className="border-b border-border/60 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              {eyebrow}
            </p>
            <h3 className="mt-1 font-sans text-lg font-semibold text-text-primary">{title}</h3>
            <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-surface/50 px-4 py-3 text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Total a pagar</p>
            <p className="mt-1 font-sans text-2xl font-bold tabular-nums text-text-primary">
              ${Number(String(montoActivacion).replace(',', '.')) || '0'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6 px-5 py-6 sm:px-6">
        <div>
          <p className="text-sm font-medium text-text-primary">Plan de suscripción</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PLAN_OPTIONS.map((plan) => {
              const active = periodoSuscripcionPlan === plan.value;
              return (
                <button
                  key={plan.value}
                  type="button"
                  onClick={() => onPeriodoChange(plan.value)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'border-blue-500/40 bg-blue-500/15 text-text-primary shadow-sm'
                      : 'border-border-strong bg-surface/40 text-text-secondary hover:border-blue-500/30'
                  }`}
                >
                  {plan.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-text-primary">Método de pago</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {PAYMENT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = tipoActivacion === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleTipoChange(opt.value)}
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
                backTitle={tipoActivacion === 'ONLINE' ? 'Token pasarela' : 'CVV'}
                backValue={tipoActivacion === 'ONLINE' ? tokenPasarela || '••••••••' : '•••'}
                securityNote="Pago seguro simulado para activación de tienda"
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
                  <input
                    className={`${inputClass} uppercase`}
                    value={holder}
                    readOnly
                    aria-readonly="true"
                  />
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
              {tipoActivacion === 'ONLINE' ? (
                <div>
                  <label className="text-sm font-medium text-text-primary">Token de pasarela</label>
                  <input
                    className={`${inputClass} font-mono`}
                    value={tokenPasarela}
                    onChange={(e) => onTokenChange(e.target.value)}
                    onFocus={() => setFlipped(true)}
                    onBlur={() => setFlipped(false)}
                    placeholder="tok_demo_ok"
                    required
                  />
                  <p className="mt-1 text-xs text-text-muted">Prueba rechazo con `tok_simular_rechazo`.</p>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-text-primary">CVV</label>
                  <input
                    className={`${inputClass} font-mono tracking-[0.35em]`}
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="123"
                    onFocus={() => setFlipped(true)}
                    onBlur={() => setFlipped(false)}
                    readOnly
                    value=""
                    aria-label="CVV simulado en reverso de tarjeta"
                  />
                  <p className="mt-1 text-xs text-text-muted">Se usarán los últimos 4 dígitos del número ingresado.</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-text-primary">Monto</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={inputClass}
                  value={montoActivacion}
                  onChange={(e) => onMontoChange(e.target.value)}
                  required
                />
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
                  Ingresa el número de comprobante bancario. Si lo dejas vacío, se generará uno automáticamente.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-text-primary">Monto</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={inputClass}
                  value={montoActivacion}
                  onChange={(e) => onMontoChange(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">Número de comprobante</label>
                <input
                  className={`${inputClass} font-mono`}
                  value={numeroComprobante}
                  onChange={(e) => onNumeroComprobanteChange(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="premium-button inline-flex w-full items-center justify-center gap-2 bg-emerald-600 from-emerald-600 to-teal-600 shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 sm:w-auto"
        >
          <Lock className="h-4 w-4" />
          {submitLabel}
        </button>
      </form>
    </section>
  );
}
