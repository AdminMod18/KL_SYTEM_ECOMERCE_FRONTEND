const PREFIX = 'marketplace_favoritos_v1';

export function favoritesStorageKey(sub) {
  return `${PREFIX}:${sub}`;
}

export function loadFavoriteSnapshots(sub) {
  if (!sub || typeof sub !== 'string') return [];
  try {
    const raw = localStorage.getItem(favoritesStorageKey(sub));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && x.id != null);
  } catch {
    return [];
  }
}

export function saveFavoriteSnapshots(sub, snapshots) {
  if (!sub || typeof sub !== 'string') return;
  try {
    localStorage.setItem(favoritesStorageKey(sub), JSON.stringify(snapshots));
  } catch {
    /* quota u otro error: ignorar */
  }
}
