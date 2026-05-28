import { findPresetAvatar } from '../data/presetAvatars.js';
import { useProfileAvatar } from '../hooks/useProfileAvatar.js';

const SIZE_CLASS = {
  sm: 'h-10 w-10 text-sm',
  md: 'h-16 w-16 text-lg',
  lg: 'h-20 w-20 text-xl',
};

/**
 * @param {{
 *   userKey?: string | null;
 *   initials?: string;
 *   size?: 'sm' | 'md' | 'lg';
 *   className?: string;
 *   title?: string;
 * }} props
 */
export function ProfileAvatar({ userKey, initials = '?', size = 'md', className = '', title }) {
  const { config } = useProfileAvatar(userKey);
  const sizeClass = SIZE_CLASS[size] ?? SIZE_CLASS.md;

  if (config?.kind === 'photo') {
    return (
      <img
        src={config.dataUrl}
        alt=""
        title={title}
        className={`${sizeClass} shrink-0 rounded-full object-cover shadow-lg ring-2 ring-white/20 ${className}`}
      />
    );
  }

  if (config?.kind === 'preset') {
    const preset = findPresetAvatar(config.presetId);
    if (preset) {
      return (
        <div
          title={title}
          className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${preset.gradient} shadow-lg shadow-blue-500/20 ${className}`}
          aria-hidden={!title}
        >
          <span className="select-none">{preset.emoji}</span>
        </div>
      );
    }
  }

  return (
    <div
      title={title}
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 font-semibold text-white shadow-lg shadow-blue-500/25 ${className}`}
      aria-hidden={!title}
    >
      {initials}
    </div>
  );
}
