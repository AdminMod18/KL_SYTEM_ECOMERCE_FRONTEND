import { useRef, useState } from 'react';
import { Camera, ImagePlus, RotateCcw, X } from 'lucide-react';
import { PRESET_AVATARS } from '../data/presetAvatars.js';
import { useProfileAvatar } from '../hooks/useProfileAvatar.js';
import { compressImageToDataUrl } from '../utils/compressImageToDataUrl.js';
import { ProfileAvatar } from './ProfileAvatar.jsx';

/**
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   userKey?: string | null;
 *   initials?: string;
 * }} props
 */
export function ProfileAvatarPicker({ open, onClose, userKey, initials = '?' }) {
  const { config, setPresetAvatar, setPhotoAvatar, resetAvatar } = useProfileAvatar(userKey);
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setLoading(true);
    try {
      const dataUrl = await compressImageToDataUrl(file, 80000);
      setPhotoAvatar(dataUrl);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la imagen.');
    } finally {
      setLoading(false);
    }
  }

  function handlePreset(presetId) {
    setPresetAvatar(presetId);
    onClose();
  }

  function handleReset() {
    resetAvatar();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="avatar-picker-title">
      <button type="button" className="absolute inset-0 bg-page/70 backdrop-blur-sm" aria-label="Cerrar" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-card">
        <div className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
          <div>
            <p id="avatar-picker-title" className="font-sans text-lg font-semibold text-text-primary">
              Tu foto de perfil
            </p>
            <p className="mt-0.5 text-sm text-text-secondary">Elige un avatar o sube una imagen.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-strong p-2 text-text-muted transition hover:text-text-primary"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-surface/40 p-4">
            <ProfileAvatar userKey={userKey} initials={initials} size="lg" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">Vista previa</p>
              <p className="mt-1 text-xs text-text-muted">
                {config?.kind === 'photo'
                  ? 'Foto personalizada'
                  : config?.kind === 'preset'
                    ? 'Avatar seleccionado'
                    : 'Iniciales por defecto'}
              </p>
            </div>
          </div>

          <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-text-muted">Avatares</p>
          <ul className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
            {PRESET_AVATARS.map((preset) => {
              const active = config?.kind === 'preset' && config.presetId === preset.id;
              return (
                <li key={preset.id}>
                  <button
                    type="button"
                    title={preset.label}
                    onClick={() => handlePreset(preset.id)}
                    className={`flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-br text-xl transition ${
                      preset.gradient
                    } ${active ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-surface' : 'hover:scale-105'}`}
                  >
                    {preset.emoji}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="sr-only" onChange={handleFileChange} />
            <button
              type="button"
              disabled={loading}
              onClick={() => inputRef.current?.click()}
              className="premium-button inline-flex flex-1 items-center justify-center gap-2 disabled:opacity-50"
            >
              <ImagePlus className="h-4 w-4" />
              {loading ? 'Procesando…' : 'Subir foto'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border-strong px-4 py-2.5 text-sm font-semibold text-text-primary transition hover:border-brand"
            >
              <RotateCcw className="h-4 w-4" />
              Usar iniciales
            </button>
          </div>

          {error ? (
            <p className="mt-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}

          <p className="mt-4 text-xs text-text-muted">La foto se guarda en este dispositivo vinculada a tu usuario.</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Avatar clickeable que abre el selector.
 */
export function ProfileAvatarEditable({ userKey, initials, size = 'md', className = '' }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${className}`}
        aria-label="Cambiar foto de perfil"
      >
        <ProfileAvatar userKey={userKey} initials={initials} size={size} />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 opacity-0 transition group-hover:opacity-100">
          <Camera className="h-5 w-5 text-white" aria-hidden />
        </span>
      </button>
      <ProfileAvatarPicker open={open} onClose={() => setOpen(false)} userKey={userKey} initials={initials} />
    </>
  );
}
