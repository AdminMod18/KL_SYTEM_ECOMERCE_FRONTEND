import { motion } from 'framer-motion';
import { CreditCard, Lock } from 'lucide-react';

/**
 * Tarjeta de crédito interactiva con flip (solo UI).
 */
export function InteractiveCreditCard({
  cardNumberPreview,
  expiryPreview,
  holder,
  brand,
  flipped = false,
  backTitle = 'CVV',
  backValue = '•••',
  securityNote = 'Pago seguro simulado',
}) {
  return (
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
              <div className="rounded-lg bg-white/10 px-3 py-1 text-[10px] font-bold tracking-[0.25em]">{brand}</div>
              <CreditCard className="h-8 w-8 text-white/70" />
            </div>
            <div>
              <p className="font-mono text-base tracking-[0.14em] sm:text-xl sm:tracking-[0.16em]">{cardNumberPreview}</p>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">Titular</p>
                  <p className="truncate text-sm font-semibold tracking-wide">{holder}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/55">Vence</p>
                  <p className="font-mono text-sm font-semibold tabular-nums">{expiryPreview}</p>
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{backTitle}</p>
              <p className="mt-1 truncate font-mono text-lg tracking-[0.2em] text-slate-900">{backValue || '••••••••'}</p>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs text-white/60">
              <Lock className="h-3.5 w-3.5" />
              {securityNote}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
