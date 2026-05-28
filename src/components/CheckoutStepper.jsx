import { Check, CreditCard, Package } from 'lucide-react';

const STEPS = [
  { id: 1, key: 'pedido', label: 'Pedido', icon: Package },
  { id: 2, key: 'pago', label: 'Pago', icon: CreditCard },
];

/**
 * @param {{ current: 1 | 2; pagoCompleto?: boolean }} props
 */
export function CheckoutStepper({ current, pagoCompleto = false }) {
  return (
    <nav aria-label="Progreso del checkout" className="glass-panel mb-8 rounded-2xl p-4 sm:p-5">
      <ol className="grid gap-3 sm:grid-cols-2">
        {STEPS.map((step) => {
          const done = step.id < current || (step.id === 2 && pagoCompleto);
          const active = step.id === current && !pagoCompleto;
          const Icon = step.icon;
          return (
            <li
              key={step.key}
              className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition ${
                active
                  ? 'border-blue-500/40 bg-blue-500/10'
                  : done
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-border/60 bg-surface/40 opacity-60'
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  active ? 'bg-blue-600 text-white' : done ? 'bg-emerald-600 text-white' : 'bg-surface-muted text-text-muted'
                }`}
              >
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Paso {step.id}</p>
                <p className={`truncate text-sm font-semibold ${active || done ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {step.label}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
