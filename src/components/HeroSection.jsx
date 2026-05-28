import { Link } from 'react-router-dom';
import { HERO, STATS } from '../data/marketplaceContent.js';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/30 bg-white/55 px-4 py-16 text-center shadow-card backdrop-blur-xl dark:border-slate-700/40 dark:bg-slate-900/60 sm:px-6 sm:py-20 lg:py-24">
      <motion.div
        className="pointer-events-none absolute -right-10 top-0 h-56 w-56 rounded-full bg-violet-400/30 blur-3xl"
        animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.8, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="mx-auto max-w-4xl">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1 rounded-full bg-badge-bg px-4 py-1.5 text-xs font-semibold text-badge-text"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {HERO.eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 font-sans text-hero-xl text-text-primary"
        >
          {HERO.title} <span className="gradient-text">premium</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lead text-text-secondary"
        >
          {HERO.subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/catalog"
            className="premium-button inline-flex items-center justify-center gap-2 px-8 py-3.5"
          >
            {HERO.primaryCta}
            <span aria-hidden>→</span>
          </Link>
          <Link
            to="/catalog"
            className="inline-flex items-center justify-center rounded-full border border-black bg-transparent px-8 py-3.5 text-sm font-semibold text-text-primary transition hover:bg-black/[0.03] dark:border-white/30 dark:hover:bg-white/10"
          >
            {HERO.secondaryCta}
          </Link>
        </motion.div>
      </div>

      <dl className="mx-auto mt-16 grid max-w-4xl gap-4 border-t border-border pt-10 sm:grid-cols-3">
        {STATS.map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-panel p-5"
          >
            <dt className="font-sans text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">{s.value}</dt>
            <dd className="mt-2 text-sm font-medium text-text-secondary">{s.label}</dd>
          </motion.div>
        ))}
      </dl>
    </section>
  );
}
