import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { hasAnyRole } from '../auth/roles.js';

/**
 * Rutas que requieren sesión. Fuente de verdad: {@link useAuth} (token en localStorage, sincrónico en el primer render → sin parpadeo típico de “auth async”).
 *
 * @param {{ children: import('react').ReactNode; roles?: string[] }} props
 * @param {string[]} [props.roles] Si se indica, al menos uno de estos roles (JWT) es obligatorio.
 */
export function ProtectedRoute({ children, roles: requiredRoles }) {
  const { isAuthenticated, roles } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiredRoles?.length && !hasAnyRole(roles, requiredRoles)) {
    return <Navigate to="/cuenta/perfil?forbidden=1" replace />;
  }

  return children;
}
