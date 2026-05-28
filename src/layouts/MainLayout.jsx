import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar.jsx';
import { Footer } from '../components/Footer.jsx';
import { motion } from 'framer-motion';

function PageFallback() {
  return (
    <div className="glass-panel mx-auto max-w-3xl rounded-2xl px-6 py-10 text-center">
      <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      <p className="mt-4 text-sm font-medium text-text-secondary">Cargando módulo…</p>
    </div>
  );
}

/**
 * Layout único alineado al storefront (login/registro incluidos).
 */
export function MainLayout() {
  const location = useLocation();

  return (
    <div className="relative flex min-h-screen flex-col bg-mesh">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl"
          animate={{ x: [0, 22, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-0 top-32 h-80 w-80 rounded-full bg-violet-400/20 blur-3xl"
          animate={{ x: [0, -24, 0], y: [0, 16, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <Navbar variant="storefront" />
      <main className="relative z-10 flex-1">
        <div className="mx-auto w-full max-w-wide px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <Suspense fallback={<PageFallback />}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </Suspense>
        </div>
      </main>
      <Footer variant="storefront" />
    </div>
  );
}
