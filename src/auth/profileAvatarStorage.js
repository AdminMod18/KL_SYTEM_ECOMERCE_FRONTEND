const PREFIX = 'kl_profile_avatar_';

export const PROFILE_AVATAR_CHANGED = 'kl:profile-avatar-changed';

function normalizeUserKey(userKey) {
  return String(userKey ?? '').trim().toLowerCase();
}

function storageKey(userKey) {
  return `${PREFIX}${normalizeUserKey(userKey)}`;
}

/**
 * @typedef {{ kind: 'preset'; presetId: string } | { kind: 'photo'; dataUrl: string } | null} ProfileAvatarConfig
 */

/**
 * @param {string | null | undefined} userKey
 * @returns {ProfileAvatarConfig}
 */
export function getStoredProfileAvatar(userKey) {
  const key = normalizeUserKey(userKey);
  if (!key) return null;
  try {
    const raw = localStorage.getItem(storageKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.kind === 'preset' && typeof parsed.presetId === 'string') {
      return { kind: 'preset', presetId: parsed.presetId };
    }
    if (parsed?.kind === 'photo' && typeof parsed.dataUrl === 'string' && parsed.dataUrl.startsWith('data:image/')) {
      return { kind: 'photo', dataUrl: parsed.dataUrl };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * @param {string | null | undefined} userKey
 * @param {ProfileAvatarConfig} config
 */
export function saveStoredProfileAvatar(userKey, config) {
  const key = normalizeUserKey(userKey);
  if (!key) return;
  if (config == null) {
    localStorage.removeItem(storageKey(key));
  } else {
    localStorage.setItem(storageKey(key), JSON.stringify(config));
  }
  window.dispatchEvent(new Event(PROFILE_AVATAR_CHANGED));
}

/**
 * @param {string | null | undefined} userKey
 */
export function clearStoredProfileAvatar(userKey) {
  saveStoredProfileAvatar(userKey, null);
}
