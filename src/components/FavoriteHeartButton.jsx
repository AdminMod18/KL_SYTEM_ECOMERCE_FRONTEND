function HeartIcon({ filled }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

/**
 * Botón de favorito; debe detener propagación si va sobre un enlace.
 * @param {{ active: boolean; onPress: (e: React.MouseEvent) => void; className?: string; variant?: 'onDark' | 'onLight' }} props
 */
export function FavoriteHeartButton({ active, onPress, className = '', variant = 'onDark' }) {
  const surface =
    variant === 'onLight'
      ? `border-border-strong bg-surface text-text-primary shadow-card backdrop-blur-sm hover:bg-brand-soft hover:border-brand ${active ? '!text-red-500 !border-red-400/50 bg-red-500/[0.08]' : ''}`
      : `border-white/25 bg-black/35 text-white backdrop-blur-sm hover:bg-black/50 hover:border-white/40 ${active ? 'text-red-400 border-red-400/40 bg-black/45' : ''}`;

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onPress(e);
      }}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${surface} ${className}`.trim()}
    >
      <HeartIcon filled={active} />
    </button>
  );
}
