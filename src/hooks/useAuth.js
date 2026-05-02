import { useCallback, useEffect, useMemo, useState } from 'react';
import * as authStorage from '../auth/authStorage.js';
import { clearSellerSolicitudIdSession } from '../auth/sellerSession.js';
import { normalizeRoles } from '../auth/roles.js';
import { profileClaimsFromToken } from '../utils/jwtPayload.js';

export function useAuth() {
  const [token, setToken] = useState(() => authStorage.getAccessToken());
  const [roles, setRoles] = useState(() => authStorage.getRoles());

  const syncFromStorage = useCallback(() => {
    setToken(authStorage.getAccessToken());
    setRoles(authStorage.getRoles());
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'accessToken' || e.key === 'roles' || e.key === null) {
        syncFromStorage();
      }
    };
    window.addEventListener('storage', onStorage);
    window.addEventListener('auth:changed', syncFromStorage);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth:changed', syncFromStorage);
    };
  }, [syncFromStorage]);

  const logout = useCallback(() => {
    authStorage.clearSession();
    clearSellerSolicitudIdSession();
    syncFromStorage();
    window.dispatchEvent(new Event('auth:changed'));
  }, [syncFromStorage]);

  const isAuthenticated = Boolean(token);
  const rolesNormalized = useMemo(() => normalizeRoles(roles), [roles]);
  const { sub, email, name } = useMemo(() => profileClaimsFromToken(token), [token]);
  const username = sub;

  const displayName = useMemo(() => {
    if (name && String(name).trim()) return String(name).trim();
    if (sub && sub.includes('@')) return sub.split('@')[0].replace(/[._]/g, ' ');
    return sub;
  }, [name, sub]);

  return useMemo(
    () => ({
      token,
      roles,
      rolesNormalized,
      username,
      email,
      displayName,
      isAuthenticated,
      logout,
      syncFromStorage,
    }),
    [token, roles, rolesNormalized, username, email, displayName, isAuthenticated, logout, syncFromStorage],
  );
}
