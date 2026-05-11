import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as favoritesStorage from '../auth/favoritesStorage.js';
import * as authStorage from '../auth/authStorage.js';
import { profileClaimsFromToken } from '../utils/jwtPayload.js';

const FavoritesContext = createContext(null);

function initialFavoritesFromStorage() {
  const token = authStorage.getAccessToken();
  const { sub } = profileClaimsFromToken(token);
  if (!sub) return [];
  return favoritesStorage.loadFavoriteSnapshots(sub);
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(initialFavoritesFromStorage);

  const reloadFromStorage = useCallback(() => {
    const token = authStorage.getAccessToken();
    const { sub } = profileClaimsFromToken(token);
    if (!sub) {
      setFavorites([]);
      return;
    }
    setFavorites(favoritesStorage.loadFavoriteSnapshots(sub));
  }, []);

  useEffect(() => {
    const onAuth = () => reloadFromStorage();
    window.addEventListener('auth:changed', onAuth);
    const onStorage = (e) => {
      const token = authStorage.getAccessToken();
      const { sub } = profileClaimsFromToken(token);
      if (!sub || !e.key) return;
      if (e.key === favoritesStorage.favoritesStorageKey(sub)) reloadFromStorage();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('auth:changed', onAuth);
      window.removeEventListener('storage', onStorage);
    };
  }, [reloadFromStorage]);

  const isFavorite = useCallback(
    (productId) => favorites.some((x) => String(x.id) === String(productId)),
    [favorites],
  );

  const toggleFavorite = useCallback((snapshot) => {
    if (!snapshot || snapshot.id == null) return { ok: false, reason: 'invalid' };
    const token = authStorage.getAccessToken();
    const { sub } = profileClaimsFromToken(token);
    if (!sub) return { ok: false, reason: 'login' };

    setFavorites((prev) => {
      const exists = prev.some((x) => String(x.id) === String(snapshot.id));
      const next = exists
        ? prev.filter((x) => String(x.id) !== String(snapshot.id))
        : [...prev, { ...snapshot }];
      favoritesStorage.saveFavoriteSnapshots(sub, next);
      return next;
    });
    return { ok: true };
  }, []);

  const removeFavorite = useCallback((productId) => {
    const token = authStorage.getAccessToken();
    const { sub } = profileClaimsFromToken(token);
    setFavorites((prev) => {
      const next = prev.filter((x) => String(x.id) !== String(productId));
      if (sub) favoritesStorage.saveFavoriteSnapshots(sub, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ favorites, isFavorite, toggleFavorite, removeFavorite, reloadFromStorage }),
    [favorites, isFavorite, toggleFavorite, removeFavorite, reloadFromStorage],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites debe usarse dentro de FavoritesProvider');
  return ctx;
}
