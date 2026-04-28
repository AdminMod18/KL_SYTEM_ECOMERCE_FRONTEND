/** Iconos del bloque “trust” alineados al prototipo (cuadrado azul muy claro + trazo azul). */
export function TrustFeatureIcon({ type }) {
  const wrap = 'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-feature-icon-bg';
  const stroke = 'h-6 w-6 text-feature-icon';

  if (type === 'clock') {
    return (
      <div className={wrap} aria-hidden>
        <svg className={stroke} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  }

  if (type === 'chat') {
    return (
      <div className={wrap} aria-hidden>
        <svg className={stroke} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={wrap} aria-hidden>
      <svg className={stroke} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  );
}
