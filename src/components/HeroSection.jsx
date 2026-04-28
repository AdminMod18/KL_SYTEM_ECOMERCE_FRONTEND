import { Link } from 'react-router-dom';
import { HERO, STATS } from '../data/marketplaceContent.js';

export function HeroSection() {
  return (
    <section className="relative px-4 py-16 text-center sm:px-6 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-4xl">
        <p className="inline-flex rounded-full bg-badge-bg px-4 py-1.5 text-xs font-semibold text-badge-text">{HERO.eyebrow}</p>
        <h1 className="mt-8 font-sans text-hero-xl text-text-primary">{HERO.title}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lead text-text-secondary">{HERO.subtitle}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/catalog"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black/90"
          >
            {HERO.primaryCta}
            <span aria-hidden>→</span>
          </Link>
          <Link
            to="/catalog"
            className="inline-flex items-center justify-center rounded-full border border-black bg-transparent px-8 py-3.5 text-sm font-semibold text-text-primary transition hover:bg-black/[0.03]"
          >
            {HERO.secondaryCta}
          </Link>
        </div>
      </div>

      <dl className="mx-auto mt-20 grid max-w-4xl gap-10 border-t border-border pt-12 sm:grid-cols-3">
        {STATS.map((s) => (
          <div key={s.label}>
            <dt className="font-sans text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">{s.value}</dt>
            <dd className="mt-2 text-sm font-medium text-text-secondary">{s.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
