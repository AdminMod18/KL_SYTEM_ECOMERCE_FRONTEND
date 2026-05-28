import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { motion } from 'framer-motion';

export function CuentaConfiguracion() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-2xl p-6 shadow-card"
      >
        <h2 className="font-sans text-base font-semibold text-text-primary">Sesión</h2>
        <p className="mt-2 text-sm text-text-secondary">Cierra sesión en este dispositivo.</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-semibold text-text-primary hover:bg-page"
        >
          Cerrar sesión
        </button>
      </motion.div>
      <p className="text-xs text-text-muted">
        Opciones avanzadas de cuenta (notificaciones, direcciones, etc.) pueden añadirse cuando el backend las exponga.
      </p>
    </div>
  );
}
