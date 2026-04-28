import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { SITE_NAME } from '../data/marketplaceContent.js';

const inputClass =
  'mt-2 w-full rounded-full border-0 bg-search-field px-5 py-3 text-sm text-text-primary placeholder:text-text-muted shadow-inner ring-1 ring-inset ring-black/[0.06] focus:outline-none focus:ring-2 focus:ring-cart-badge/35';

export function Registro() {
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/usuarios', {
        nombreUsuario,
        email,
        nombreCompleto,
      });
      navigate('/login');
    } catch (err) {
      const body = err.response?.data;
      const campos = body?.properties?.campos ?? body?.campos;
      const msg =
        body?.detail ??
        body?.title ??
        (campos ? JSON.stringify(campos) : err.message) ??
        'Registration failed.';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:gap-14">
      <div className="hidden flex-col justify-center rounded-2xl border border-border bg-surface p-10 shadow-card lg:flex">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-badge-text">Join {SITE_NAME}</p>
        <h1 className="mt-4 font-sans text-4xl font-bold tracking-tight text-text-primary md:text-5xl">Create your account</h1>
        <p className="mt-4 text-lead text-text-secondary">One account for checkout, orders, and seller tools.</p>
      </div>

      <div>
        <div className="lg:hidden">
          <h1 className="font-sans text-3xl font-bold tracking-tight text-text-primary">Create account</h1>
          <p className="mt-2 text-sm text-text-secondary">Register with the user service API.</p>
        </div>
        <div className="hidden lg:block">
          <h2 className="font-sans text-3xl font-bold tracking-tight text-text-primary">Sign up</h2>
          <p className="mt-2 text-sm text-text-secondary">Fill in your details to get started.</p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-2xl border border-border bg-surface p-8 shadow-card">
          {error && (
            <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
          )}
          <div>
            <label className="text-sm font-medium text-text-primary">Username</label>
            <input className={inputClass} value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} minLength={3} required />
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary">Email</label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary">Full name</label>
            <input className={inputClass} value={nombreCompleto} onChange={(e) => setNombreCompleto(e.target.value)} required />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-black py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black/90 disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>
          <p className="text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link className="font-semibold text-cart-badge hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
