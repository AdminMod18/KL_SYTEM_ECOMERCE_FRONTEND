import { Link } from 'react-router-dom';

export function CategoryCard({ title, description, to }) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-2xl border border-border bg-surface p-6 shadow-card transition duration-200 hover:border-border-strong hover:shadow-card-hover"
    >
      <h3 className="font-sans text-xl font-semibold tracking-tight text-text-primary group-hover:text-black">{title}</h3>
      {description && <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>}
      <span className="mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-wider text-text-muted transition group-hover:text-brand">
        Browse
        <svg className="ml-1 h-3.5 w-3.5 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </span>
    </Link>
  );
}
