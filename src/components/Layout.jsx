import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
  }`;

export function Layout({ children }) {
  const { items } = useCart();
  const count = items.reduce((a, i) => a + i.cantidad, 0);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight text-white">
            Marketplace
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/catalogo" className={linkClass}>
              Catálogo
            </NavLink>
            <NavLink to="/carrito" className={linkClass}>
              Carrito
              {count > 0 && (
                <span className="ml-1 rounded-full bg-indigo-500 px-2 py-0.5 text-xs text-white">{count}</span>
              )}
            </NavLink>
            <NavLink to="/checkout" className={linkClass}>
              Checkout
            </NavLink>
            <NavLink to="/login" className={linkClass}>
              Login
            </NavLink>
            <NavLink to="/registro" className={linkClass}>
              Registro
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
