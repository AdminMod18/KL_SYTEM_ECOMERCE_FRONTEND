import { motion } from 'framer-motion';

/**
 * Overlay global mientras hay actividad de red (axios) o candado manual.
 * No sustituye spinners locales en formularios: conviven; para omitir el global en una petición usar `skipGlobalLoading` en la config de axios.
 */
export function GlobalLoader({ visible }) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-page/55 backdrop-blur-[2px] transition-opacity"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Cargando"
    >
      <div className="glass-panel flex flex-col items-center gap-4 rounded-2xl px-10 py-8">
        <motion.span
          className="h-10 w-10 rounded-full border-2 border-cart-badge border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
          aria-hidden
        />
        <p className="text-sm font-medium text-text-secondary">Cargando…</p>
      </div>
    </motion.div>
  );
}
