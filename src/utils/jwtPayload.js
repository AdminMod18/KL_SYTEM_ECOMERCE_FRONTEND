/**
 * Decodifica el payload del JWT (sin verificar firma; solo UI).
 * @param {string | null | undefined} token
 * @returns {Record<string, unknown> | null}
 */
export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    if (pad) b64 += '='.repeat(4 - pad);
    const json = atob(b64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * @param {string | null | undefined} token
 * @returns {{ sub: string | null; email: string | null; name: string | null }}
 */
export function profileClaimsFromToken(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload !== 'object') {
    return { sub: null, email: null, name: null };
  }
  const sub = typeof payload.sub === 'string' && payload.sub.length ? payload.sub : null;
  const email = typeof payload.email === 'string' && payload.email.length ? payload.email : null;
  const name =
    typeof payload.name === 'string' && payload.name.length
      ? payload.name
      : typeof payload.preferred_username === 'string' && payload.preferred_username.length
        ? payload.preferred_username
        : null;
  return { sub, email, name };
}

export function initialsFromProfile({ sub, email, name }) {
  const base = name?.trim() || '';
  if (base.length >= 2) {
    const parts = base.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase().slice(0, 2);
    }
    return base.slice(0, 2).toUpperCase();
  }
  const mail = email?.trim() || '';
  if (mail.includes('@')) {
    const local = mail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  }
  const s = sub?.trim() || '?';
  return s.slice(0, 2).toUpperCase();
}
