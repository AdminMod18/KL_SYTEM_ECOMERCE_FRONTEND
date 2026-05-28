import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, CreditCard, Lock, Sparkles, Wallet } from 'lucide-react';

function formatCardNumber(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

function formatExpiry(value) {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function cardBrandLabel(num) {
  const d = String(num ?? '').replace(/\D/g, '');
  if (/^4/.test(d)) return 'VISA';
  if (/^5[1-5]/.test(d)) return 'MASTERCARD';
  if (/^3[47]/.test(d)) return 'AMEX';
  return 'PREMIUM';
}

function displayCardNumber(num) {
  const formatted = formatCardNumber(num);
  if (!formatted) return '•••• •••• •••• ••••';
  const digits = formatted.replace(/\s/g, '');
  const masked = digits
    .split('')
    .map((ch, i) => (i < digits.length - 4 ? '•' : ch))
    .join('');
  return formatCardNumber(masked) || '•••• •••• •••• ••••';
}

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
  const [cardNumber, setCardNumber] = useState(() => {
    const last4 = String(ultimosDigitosTarjetaActivacion ?? '').replace(/\D/g, '').slice(-4);
    return last4 ? `424242424242${last4}`.slice(-16) : '4242424242424242';
  });
  const [expiry, setExpiry] = useState('12/28');
  const [flipped, setFlipped] = useState(false);

  const showCard = tipoActivacion === 'ONLINE' || tipoActivacion === 'TARJETA';
  const brand = useMemo(() => cardBrandLabel(cardNumber), [cardNumber]);
  const holder = (cardHolderName || 'TU NOMBRE').toUpperCase().slice(0, 26);

  function handleCardNumberChange(raw) {
    const formatted = formatCardNumber(raw);
    setCardNumber(formatted.replace(/\s/g, ''));
    if (tipoActivacion === 'TARJETA') {
      const digits = formatted.replace(/\D/g, '');
      onUltimosDigitosChange(digits.slice(-4));
    }
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
              Activación
            </p>
            <h3 className="mt-1 font-sans text-lg font-semibold text-text-primary">Activar tu tienda</h3>
            <p className="mt-1 text-sm text-text-secondary">Completa el pago para habilitar la publicación de productos.</p>
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
              <div className="w-full max-w-[420px] [perspective:1200px]">
                <motion.div
                  className="relative mx-auto aspect-[1.586/1] w-full max-w-[420px]"
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div
                    className="absolute inset-0 overflow-hidden rounded-[1.35rem] border border-white/20 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-900 p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.45)] [backface-visibility:hidden]"
                    style={{ transform: 'rotateY(0deg)' }}
                  >
                    <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                    <div className="pointer-events-none absolute bottom-0 left-0 h-28 w-28 rounded-full bg-blue-400/20 blur-2xl" />
                    <div className="relative flex h-full flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <div className="rounded-lg bg-white/10 px-3 py-1 text-[10px] font-bold tracking-[0.25em]">
                          {brand}
                        </div>
                        <CreditCard className="h-8 w-8 text-white/70" />
                      </div>
                      <div>
                        <p className="font-mono text-xl tracking-[0.18em] sm:text-2xl">{displayCardNumber(cardNumber)}</p>
                        <div className="mt-5 flex items-end justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">Titular</p>
                            <p className="truncate text-sm font-semibold tracking-wide">{holder}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">Vence</p>
                            <p className="font-mono text-sm font-semibold">{expiry || 'MM/YY'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="absolute inset-0 overflow-hidden rounded-[1.35rem] border border-white/20 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-[0_24px_60px_rgba(15,23,42,0.45)] [backface-visibility:hidden]"
                    style={{ transform: 'rotateY(180deg)' }}
                  >
                    <div className="mt-6 h-10 bg-black/45" />
                    <div className="px-6 pt-6">
                      <div className="ml-auto w-[82%] rounded-lg bg-white/95 px-4 py-3 text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {tipoActivacion === 'ONLINE' ? 'Token pasarela' : 'CVV'}
                        </p>
                        <p className="mt-1 font-mono text-lg tracking-[0.3em] text-slate-900">
                          {tipoActivacion === 'ONLINE'
                            ? tokenPasarela || '••••••••'
                            : '•••'}
                        </p>
                      </div>
                      <p className="mt-4 flex items-center gap-2 text-xs text-white/60">
                        <Lock className="h-3.5 w-3.5" />
                        Pago seguro simulado para activación de tienda
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
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
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
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
          {loading ? 'Procesando pago…' : 'Activar tienda'}
        </button>
      </form>
    </section>
  );
}
