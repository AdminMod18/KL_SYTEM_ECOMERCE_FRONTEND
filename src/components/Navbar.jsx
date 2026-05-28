import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { SITE_NAME } from '../data/marketplaceContent.js';
import { isAdmin } from '../auth/roles.js';
import { Moon, Search, ShoppingBag, Sun, UserRound, X, Menu, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext.jsx';

function storefrontNavLink({ isActive }) {
  return `rounded-full px-3 py-2 text-sm font-medium transition-colors tap-highlight-transparent ${
    isActive ? 'bg-black/5 text-text-primary' : 'text-text-secondary hover:text-text-primary'
  }`;
}

function authNavLink({ isActive }) {
  return `rounded-lg px-3 py-2 text-sm font-medium transition-colors tap-highlight-transparent ${
    isActive ? 'bg-white/10 text-authText' : 'text-authSecondary hover:bg-white/5 hover:text-authText'
  }`;
}

export function Navbar({ variant = 'storefront' }) {
  const navigate = useNavigate();
  const { items } = useCart();
  const { isAuthenticated, logout, roles } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const verAdmin = isAdmin(roles);
  const count = items.reduce((a, i) => a + i.cantidad, 0);
  const [open, setOpen] = useState(false);
  const isAuth = variant === 'auth';
  const navClass = isAuth ? authNavLink : storefrontNavLink;

  function handleLogout() {
    logout();
    setOpen(false);
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/65 backdrop-blur-xl dark:bg-slate-950/60">
      <div className="mx-auto flex max-w-wide items-center gap-3 px-4 py-3.5 sm:px-6 lg:gap-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-text-primary lg:hidden"
            aria-expanded={open}
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-text-primary"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25">
              <Sparkles className="h-4 w-4" />
            </span>
            {SITE_NAME}
          </Link>
        </div>

        <nav className={`hidden items-center gap-0.5 lg:flex ${isAuth ? '' : ''}`}>
          {isAuth ? (
            <>
              <NavLink to="/" end className={navClass}>
                Home
              </NavLink>
              <NavLink to="/catalog" className={navClass}>
                Catalog
              </NavLink>
              <NavLink to="/checkout" className={navClass}>
                Checkout
              </NavLink>
              <NavLink to="/become-seller" className={navClass}>
                Seller
              </NavLink>
              {isAuthenticated ? (
                <NavLink to="/cuenta/perfil" className={navClass}>
                  Mi cuenta
                </NavLink>
              ) : null}
              {isAuthenticated && verAdmin ? (
                <>
                  <NavLink to="/director" className={navClass}>
                    Director
                  </NavLink>
                  <NavLink to="/director/bam" className={navClass}>
                    BAM
                  </NavLink>
                  <NavLink to="/director/admin" className={navClass}>
                    Admin
                  </NavLink>
                </>
              ) : null}
            </>
          ) : (
            <>
              <NavLink to="/catalog" className={navClass}>
                Catálogo
              </NavLink>
              <NavLink to="/become-seller" className={navClass}>
                Vender
              </NavLink>
              {isAuthenticated && verAdmin ? (
                <>
                  <NavLink to="/director" className={navClass}>
                    Director
                  </NavLink>
                  <NavLink to="/director/bam" className={navClass}>
                    BAM
                  </NavLink>
                  <NavLink to="/director/admin" className={navClass}>
                    Admin
                  </NavLink>
                </>
              ) : null}
            </>
          )}
        </nav>

        {!isAuth && (
          <div className="mx-auto hidden max-w-lg flex-1 px-4 lg:block">
            <label htmlFor="nav-search" className="sr-only">
              Buscar
            </label>
            <div className="glass-panel relative rounded-full border-white/50 px-1 py-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" aria-hidden />
              <input
                id="nav-search"
                type="search"
                placeholder="Buscar"
                className="w-full rounded-full border-0 bg-search-field py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              />
            </div>
          </div>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition hover:text-text-primary"
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            to="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-primary shadow-sm transition hover:border-border-strong"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-cart-badge px-1 text-[10px] font-bold text-cart-badge-text">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <>
              {!isAuth ? (
                <Link
                  to="/cuenta/perfil"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-primary shadow-sm transition hover:border-border-strong"
                  aria-label="Mi cuenta"
                >
                  <UserRound className="h-5 w-5 text-text-secondary" />
                </Link>
              ) : null}
              <button
                type="button"
                onClick={handleLogout}
                className={
                  isAuth
                    ? 'hidden rounded-full border border-authBorder px-4 py-2 text-sm font-semibold text-authText hover:bg-white/10 sm:inline-flex'
                    : 'hidden rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-primary hover:bg-page sm:inline-flex'
                }
              >
                {isAuth ? 'Log out' : 'Cerrar sesión'}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={
                  isAuth
                    ? 'hidden text-sm font-medium text-authSecondary hover:text-authText sm:inline'
                    : 'hidden text-sm font-medium text-text-secondary hover:text-text-primary sm:inline-block'
                }
              >
                {isAuth ? 'Log in' : 'Iniciar sesión'}
              </Link>
              <Link
                to="/register"
                className={
                  isAuth
                    ? 'hidden rounded-full bg-authBtn px-4 py-2 text-sm font-semibold text-authBtnText hover:bg-white sm:inline-flex'
                    : 'hidden rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90 sm:inline-flex'
                }
              >
                {isAuth ? 'Sign up' : 'Registrarse'}
              </Link>
              {!isAuth && (
                <Link to="/login" className="hidden h-10 w-10 items-center justify-center rounded-full border border-border bg-surface sm:flex" aria-label="Iniciar sesión">
                  <UserRound className="h-5 w-5 text-text-secondary" />
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={isAuth ? 'border-t border-authBorder bg-authPage px-4 py-3 lg:hidden' : 'border-t border-border bg-white/90 px-4 py-3 backdrop-blur lg:hidden'}
          >
          <nav className="flex flex-col gap-1">
            {isAuth ? (
              <>
                <NavLink to="/" end className={navClass} onClick={() => setOpen(false)}>
                  Home
                </NavLink>
                <NavLink to="/catalog" className={navClass} onClick={() => setOpen(false)}>
                  Catalog
                </NavLink>
                <NavLink to="/cart" className={navClass} onClick={() => setOpen(false)}>
                  Cart
                </NavLink>
                <NavLink to="/checkout" className={navClass} onClick={() => setOpen(false)}>
                  Checkout
                </NavLink>
                <NavLink to="/become-seller" className={navClass} onClick={() => setOpen(false)}>
                  Seller
                </NavLink>
                {isAuthenticated ? (
                  <NavLink to="/cuenta/perfil" className={navClass} onClick={() => setOpen(false)}>
                    Mi cuenta
                  </NavLink>
                ) : null}
                {isAuthenticated && verAdmin ? (
                  <>
                    <NavLink to="/director" className={navClass} onClick={() => setOpen(false)}>
                      Director
                    </NavLink>
                    <NavLink to="/director/bam" className={navClass} onClick={() => setOpen(false)}>
                      BAM
                    </NavLink>
                    <NavLink to="/director/admin" className={navClass} onClick={() => setOpen(false)}>
                      Admin
                    </NavLink>
                  </>
                ) : null}
                {isAuthenticated ? (
                  <button type="button" className={`${navClass} text-left`} onClick={handleLogout}>
                    Log out
                  </button>
                ) : (
                  <>
                    <NavLink to="/login" className={navClass} onClick={() => setOpen(false)}>
                      Log in
                    </NavLink>
                    <NavLink to="/register" className={navClass} onClick={() => setOpen(false)}>
                      Sign up
                    </NavLink>
                  </>
                )}
              </>
            ) : (
              <>
                <NavLink to="/catalog" className={navClass} onClick={() => setOpen(false)}>
                  Catálogo
                </NavLink>
                <NavLink to="/become-seller" className={navClass} onClick={() => setOpen(false)}>
                  Vender
                </NavLink>
                {isAuthenticated ? (
                  <NavLink to="/cuenta/perfil" className={navClass} onClick={() => setOpen(false)}>
                    Mi cuenta
                  </NavLink>
                ) : null}
                {isAuthenticated && verAdmin ? (
                  <>
                    <NavLink to="/director" className={navClass} onClick={() => setOpen(false)}>
                      Director
                    </NavLink>
                    <NavLink to="/director/bam" className={navClass} onClick={() => setOpen(false)}>
                      BAM
                    </NavLink>
                    <NavLink to="/director/admin" className={navClass} onClick={() => setOpen(false)}>
                      Admin
                    </NavLink>
                  </>
                ) : null}
                <NavLink to="/cart" className={navClass} onClick={() => setOpen(false)}>
                  Carrito
                </NavLink>
                {isAuthenticated ? (
                  <button type="button" className={`${navClass} text-left`} onClick={handleLogout}>
                    Cerrar sesión
                  </button>
                ) : (
                  <>
                    <NavLink to="/login" className={navClass} onClick={() => setOpen(false)}>
                      Iniciar sesión
                    </NavLink>
                    <NavLink to="/register" className={navClass} onClick={() => setOpen(false)}>
                      Registrarse
                    </NavLink>
                  </>
                )}
              </>
            )}
          </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
