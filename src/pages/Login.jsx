import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { SITE_NAME } from '../data/marketplaceContent.js';

const inputClass =
  'mt-2 w-full rounded-full border-0 bg-search-field px-5 py-3 text-sm text-text-primary placeholder:text-text-muted shadow-inner ring-1 ring-inset ring-black/[0.06] focus:outline-none focus:ring-2 focus:ring-cart-badge/35';

export function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('roles', JSON.stringify(data.roles ?? []));
      if (!remember) {
        sessionStorage.setItem('accessToken', data.accessToken);
      }
      navigate('/catalog');
    } catch (err) {
      const msg =
        err.response?.data?.detail ??
        err.response?.data?.title ??
        err.message ??
        'Could not sign in.';
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:gap-14">
      <div className="hidden flex-col justify-center rounded-2xl border border-border bg-surface p-10 shadow-card lg:flex">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-badge-text">{SITE_NAME}</p>
        <h1 className="mt-4 font-sans text-4xl font-bold tracking-tight text-text-primary md:text-5xl">Welcome back</h1>
        <p className="mt-4 text-lead text-text-secondary">
          Sign in to continue shopping premium technology curated for you.
        </p>
      </div>

      <div>
        <div className="lg:hidden">
          <h1 className="font-sans text-3xl font-bold tracking-tight text-text-primary">Welcome back</h1>
          <p className="mt-2 text-sm text-text-secondary">Sign in to your account</p>
        </div>
        <div className="hidden lg:block">
          <h2 className="font-sans text-3xl font-bold tracking-tight text-text-primary">Sign in to your account</h2>
          <p className="mt-2 text-sm text-text-secondary">Enter your credentials below.</p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-2xl border border-border bg-surface p-8 shadow-card">
          {error && (
            <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
          )}
          <div>
            <label className="text-sm font-medium text-text-primary">Email / Username</label>
            <input
              className={inputClass}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary">Password</label>
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <label className="flex cursor-pointer items-center gap-2 text-text-secondary">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-border-strong bg-search-field text-cart-badge focus:ring-cart-badge/40"
              />
              Remember me
            </label>
            <button type="button" className="font-medium text-cart-badge transition hover:underline">
              Forgot password?
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-black py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black/90 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] font-semibold uppercase tracking-[0.15em]">
              <span className="bg-surface px-3 text-text-muted">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-full border border-border bg-white py-2.5 text-sm font-medium text-text-primary shadow-sm transition hover:bg-gray-50"
            >
              Google
            </button>
            <button
              type="button"
              className="rounded-full border border-border bg-white py-2.5 text-sm font-medium text-text-primary shadow-sm transition hover:bg-gray-50"
            >
              Facebook
            </button>
          </div>

          <p className="text-center text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link className="font-semibold text-cart-badge hover:underline" to="/register">
              Sign up
            </Link>
          </p>
          <p className="text-center text-xs text-text-muted">Demo: admin / admin123</p>
        </form>
      </div>
    </div>
  );
}
