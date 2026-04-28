import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { SITE_NAME } from '../data/marketplaceContent.js';

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
  const { items } = useCart();
  const count = items.reduce((a, i) => a + i.cantidad, 0);
  const [open, setOpen] = useState(false);
  const isAuth = variant === 'auth';
  const navClass = isAuth ? authNavLink : storefrontNavLink;

  return (
    <header
      className={
        isAuth
          ? 'sticky top-0 z-50 border-b border-authBorder bg-authPage/95 backdrop-blur-xl'
          : 'sticky top-0 z-50 border-b-2 border-cart-badge bg-white shadow-nav'
      }
    >
      <div className="mx-auto flex max-w-wide items-center gap-3 px-4 py-3.5 sm:px-6 lg:gap-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className={
              isAuth
                ? 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-authBorder bg-authSurface text-authText lg:hidden'
                : 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-text-primary lg:hidden'
            }
            aria-expanded={open}
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <Link
            to="/"
            className={`shrink-0 text-lg font-bold tracking-tight ${isAuth ? 'text-authText' : 'text-text-primary'}`}
          >
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
              <NavLink to="/seller" className={navClass}>
                Seller
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/catalog" className={navClass}>
                Store
              </NavLink>
              <NavLink to="/catalog" className={navClass}>
                Explore
              </NavLink>
              <NavLink to="/seller" className={navClass}>
                Sell
              </NavLink>
            </>
          )}
        </nav>

        {!isAuth && (
          <div className="mx-auto hidden max-w-lg flex-1 px-4 lg:block">
            <label htmlFor="nav-search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="nav-search"
                type="search"
                placeholder="Search"
                className="w-full rounded-full border-0 bg-search-field py-2 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted shadow-inner ring-1 ring-black/[0.04] focus:outline-none focus:ring-2 focus:ring-black/15"
              />
            </div>
          </div>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            to="/cart"
            className={
              isAuth
                ? 'relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-authBorder bg-authSurface text-authText transition hover:border-authBorderStrong'
                : 'relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-primary shadow-sm transition hover:border-border-strong'
            }
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-cart-badge px-1 text-[10px] font-bold text-cart-badge-text">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>
          <Link
            to="/login"
            className={
              isAuth
                ? 'hidden text-sm font-medium text-authSecondary hover:text-authText sm:inline'
                : 'hidden text-sm font-medium text-text-secondary hover:text-text-primary sm:inline-block'
            }
          >
            Log in
          </Link>
          <Link
            to="/register"
            className={
              isAuth
                ? 'hidden rounded-full bg-authBtn px-4 py-2 text-sm font-semibold text-authBtnText hover:bg-white sm:inline-flex'
                : 'hidden rounded-full bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90 sm:inline-flex'
            }
          >
            Sign up
          </Link>
          {!isAuth && (
            <Link to="/login" className="hidden h-10 w-10 items-center justify-center rounded-full border border-border bg-surface sm:flex" aria-label="Account">
              <svg className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {open && (
        <div className={isAuth ? 'border-t border-authBorder bg-authPage px-4 py-3 lg:hidden' : 'border-t border-border bg-white px-4 py-3 lg:hidden'}>
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
                <NavLink to="/seller" className={navClass} onClick={() => setOpen(false)}>
                  Seller
                </NavLink>
                <NavLink to="/login" className={navClass} onClick={() => setOpen(false)}>
                  Log in
                </NavLink>
                <NavLink to="/register" className={navClass} onClick={() => setOpen(false)}>
                  Sign up
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/catalog" className={navClass} onClick={() => setOpen(false)}>
                  Store
                </NavLink>
                <NavLink to="/catalog" className={navClass} onClick={() => setOpen(false)}>
                  Explore
                </NavLink>
                <NavLink to="/seller" className={navClass} onClick={() => setOpen(false)}>
                  Sell
                </NavLink>
                <NavLink to="/cart" className={navClass} onClick={() => setOpen(false)}>
                  Cart
                </NavLink>
                <NavLink to="/login" className={navClass} onClick={() => setOpen(false)}>
                  Log in
                </NavLink>
                <NavLink to="/register" className={navClass} onClick={() => setOpen(false)}>
                  Sign up
                </NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
