import { Link } from 'react-router-dom';
import { LOGO_ALT, LOGO_SRC, SITE_NAME } from '../data/marketplaceContent.js';

const SIZE_CLASS = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-14',
  xl: 'h-20',
};

/**
 * @param {{
 *   to?: string;
 *   size?: keyof typeof SIZE_CLASS;
 *   className?: string;
 *   imgClassName?: string;
 *   showTextFallback?: boolean;
 * }} props
 */
export function BrandLogo({ to = '/', size = 'md', className = '', imgClassName = '', showTextFallback = false }) {
  const heightClass = SIZE_CLASS[size] ?? SIZE_CLASS.md;
  const content = (
    <>
      <img
        src={LOGO_SRC}
        alt={LOGO_ALT}
        className={`${heightClass} w-auto max-w-[min(100%,220px)] object-contain object-left ${imgClassName}`.trim()}
      />
      {showTextFallback ? (
        <span className="sr-only">{SITE_NAME}</span>
      ) : null}
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={`inline-flex shrink-0 items-center transition-opacity hover:opacity-90 ${className}`.trim()}
        aria-label={SITE_NAME}
      >
        {content}
      </Link>
    );
  }

  return <div className={`inline-flex shrink-0 items-center ${className}`.trim()}>{content}</div>;
}
