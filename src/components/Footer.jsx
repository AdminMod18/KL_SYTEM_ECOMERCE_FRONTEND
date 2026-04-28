import { Link } from 'react-router-dom';
import { FOOTER_NAV, SITE_NAME } from '../data/marketplaceContent.js';

function SocialIcon({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition hover:bg-black/85"
    >
      {children}
    </a>
  );
}

export function Footer({ variant = 'storefront' }) {
  const isAuth = variant === 'auth';

  if (isAuth) {
    return (
      <footer className="mt-auto border-t border-authBorder bg-authPage">
        <div className="mx-auto max-w-wide px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 border-b border-authBorder pb-10 text-center sm:flex-row sm:text-left">
            <div>
              <p className="font-semibold text-authText">{SITE_NAME}</p>
              <p className="mt-2 max-w-md text-sm text-authSecondary">
                Created with Figma Make · Premium technology marketplace experience.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-authSecondary">
              <Link to="/catalog" className="transition hover:text-authText">
                Catalog
              </Link>
              <Link to="/cart" className="transition hover:text-authText">
                Cart
              </Link>
              <Link to="/login" className="transition hover:text-authText">
                Log in
              </Link>
              <Link to="/register" className="transition hover:text-authText">
                Register
              </Link>
            </div>
          </div>
          <p className="pt-8 text-center text-xs text-authMuted">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-auto border-t border-border bg-surface-muted">
      <div className="mx-auto max-w-wide px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <p className="text-lg font-bold tracking-tight text-text-primary">{SITE_NAME}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-secondary">{FOOTER_NAV.tagline}</p>
            <div className="mt-6 flex gap-3">
              <SocialIcon href="#" label="Facebook">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="X (Twitter)">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="#" label="Telegram">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 1.332-.533 2.63-.868 2.916-.966z" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          {FOOTER_NAV.columns.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold uppercase tracking-wider text-text-primary">{col.title}</p>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.to + link.label}>
                    <Link to={link.to} className="text-sm text-text-secondary transition hover:text-text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-text-muted">
            {FOOTER_NAV.legal.map((item) => (
              <Link key={item.label} to={item.to} className="transition hover:text-text-secondary">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
