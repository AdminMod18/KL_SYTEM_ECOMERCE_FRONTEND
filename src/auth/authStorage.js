const KEY_TOKEN = 'accessToken';
const KEY_ROLES = 'roles';

export function getAccessToken() {
  return localStorage.getItem(KEY_TOKEN);
}

export function getRoles() {
  try {
    const raw = localStorage.getItem(KEY_ROLES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setSession({ accessToken, roles }) {
  localStorage.setItem(KEY_TOKEN, accessToken);
  localStorage.setItem(KEY_ROLES, JSON.stringify(roles ?? []));
}

export function clearSession() {
  localStorage.removeItem(KEY_TOKEN);
  localStorage.removeItem(KEY_ROLES);
}
