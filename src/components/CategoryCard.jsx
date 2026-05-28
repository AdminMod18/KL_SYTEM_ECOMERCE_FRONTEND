import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const MotionLink = motion(Link);

export function CategoryCard({ title, description, to }) {
  return (
    <MotionLink
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      to={to}
      className="group premium-card-hover flex flex-col rounded-2xl border border-border bg-surface/90 p-6 shadow-card backdrop-blur"
    >
      <h3 className="font-sans text-xl font-semibold tracking-tight text-text-primary group-hover:text-black">{title}</h3>
      {description && <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>}
      <span className="mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-wider text-text-muted transition group-hover:text-brand">
        Browse
        <ArrowRight className="ml-1 h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
      </span>
    </MotionLink>
  );
}
