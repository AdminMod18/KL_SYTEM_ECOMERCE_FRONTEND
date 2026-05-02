import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { initialsFromProfile } from '../utils/jwtPayload.js';

const sidebarLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-black text-white' : 'text-text-secondary hover:bg-page hover:text-text-primary'
  }`;

const tabClass = ({ isActive }) =>
  `border-b-2 px-1 pb-3 text-sm font-semibold transition-colors ${
    isActive ? 'border-cart-badge text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
  }`;

function IconUser() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function IconCog() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export function CuentaLayout() {
  const { username, email, displayName } = useAuth();
  const location = useLocation();
  const initials = initialsFromProfile({
    sub: username,
    email,
    name: displayName !== username ? displayName : null,
  });
  const mailShown = email || (username?.includes('@') ? username : null);
  const showTabs = ['/cuenta/pedidos', '/cuenta/favoritos', '/cuenta/configuracion'].some((p) =>
    location.pathname.startsWith(p),
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 pb-12 lg:flex-row lg:items-start lg:gap-10">
      <aside className="w-full shrink-0 lg:w-64">
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div className="flex flex-col items-center text-center lg:items-stretch lg:text-left">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-lg font-semibold text-white"
              aria-hidden
            >
              {initials}
            </div>
            <h2 className="mt-4 font-sans text-lg font-bold text-text-primary">{displayName || 'Usuario'}</h2>
            {mailShown ? (
              <p className="mt-1 text-sm text-text-muted">{mailShown}</p>
            ) : (
              <p className="mt-1 text-xs text-text-muted">Sesión: {username || '—'}</p>
            )}
          </div>
          <nav className="mt-8 flex flex-col gap-1 border-t border-border pt-6">
            <NavLink to="/cuenta/perfil" className={sidebarLinkClass} end>
              <IconUser />
              Mi perfil
            </NavLink>
            <NavLink to="/cuenta/pedidos" className={sidebarLinkClass}>
              <IconBox />
              Mis pedidos
            </NavLink>
            <NavLink to="/cuenta/favoritos" className={sidebarLinkClass}>
              <IconHeart />
              Favoritos
            </NavLink>
            <NavLink to="/cuenta/configuracion" className={sidebarLinkClass}>
              <IconCog />
              Configuración
            </NavLink>
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {showTabs ? (
          <div className="mb-8 flex flex-wrap gap-8 border-b border-border">
            <NavLink to="/cuenta/pedidos" className={tabClass}>
              Mis pedidos
            </NavLink>
            <NavLink to="/cuenta/favoritos" className={tabClass}>
              Favoritos
            </NavLink>
            <NavLink to="/cuenta/configuracion" className={tabClass}>
              Configuración
            </NavLink>
          </div>
        ) : null}
        <Outlet />
      </div>
    </div>
  );
}
