import { useCallback, useEffect, useState } from 'react';
import {
  PROFILE_AVATAR_CHANGED,
  clearStoredProfileAvatar,
  getStoredProfileAvatar,
  saveStoredProfileAvatar,
} from '../auth/profileAvatarStorage.js';

/**
 * @param {string | null | undefined} userKey
 */
export function useProfileAvatar(userKey) {
  const [config, setConfig] = useState(() => getStoredProfileAvatar(userKey));

  const sync = useCallback(() => {
    setConfig(getStoredProfileAvatar(userKey));
  }, [userKey]);

  useEffect(() => {
    sync();
  }, [sync]);

  useEffect(() => {
    window.addEventListener(PROFILE_AVATAR_CHANGED, sync);
    return () => window.removeEventListener(PROFILE_AVATAR_CHANGED, sync);
  }, [sync]);

  const setPresetAvatar = useCallback(
    (presetId) => {
      saveStoredProfileAvatar(userKey, { kind: 'preset', presetId });
      sync();
    },
    [userKey, sync],
  );

  const setPhotoAvatar = useCallback(
    (dataUrl) => {
      saveStoredProfileAvatar(userKey, { kind: 'photo', dataUrl });
      sync();
    },
    [userKey, sync],
  );

  const resetAvatar = useCallback(() => {
    clearStoredProfileAvatar(userKey);
    sync();
  }, [userKey, sync]);

  return { config, setPresetAvatar, setPhotoAvatar, resetAvatar, sync };
}
