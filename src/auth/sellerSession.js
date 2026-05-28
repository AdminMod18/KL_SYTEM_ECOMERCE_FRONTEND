import { getAccessToken } from './authStorage.js';
import { profileClaimsFromToken } from '../utils/jwtPayload.js';

/** Clave compartida con el panel de onboarding (sessionStorage, pestaña actual). */
export const SELLER_SOLICITUD_SESSION_KEY = 'kl_seller_solicitud_id';

/** Persistencia por usuario (localStorage, sobrevive logout). */
const PERSIST_PREFIX = 'kl_seller_sol_persist_';

/** Disparar tras cambiar id en sesión para que otras vistas actualicen el mismo tab. */
export const SELLER_SESSION_CHANGED = 'kl:seller-solicitud-session';

function normalizeUserKey(userKey) {
  return String(userKey ?? '').trim().toLowerCase();
}

function persistStorageKey(userKey) {
  return `${PERSIST_PREFIX}${normalizeUserKey(userKey)}`;
}

/**
 * @param {Array<string | null | undefined>} keys
 * @returns {string[]}
 */
export function normalizeIdentityKeys(keys) {
  const out = [];
  for (const raw of keys) {
    const k = normalizeUserKey(raw);
    if (!k || out.includes(k)) continue;
    out.push(k);
  }
  return out;
}

/**
 * @returns {number | null}
 */
export function getSellerSolicitudIdFromSession() {
  const raw = sessionStorage.getItem(SELLER_SOLICITUD_SESSION_KEY);
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/**
 * @param {string | null | undefined} userKey
 * @returns {number | null}
 */
export function getPersistedSellerSolicitudId(userKey) {
  const key = normalizeUserKey(userKey);
  if (!key) return null;
  const raw = localStorage.getItem(persistStorageKey(key));
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/**
 * @param {Array<string | null | undefined>} identityKeys
 * @returns {number | null}
 */
export function getPersistedSellerSolicitudIdFromIdentities(identityKeys) {
  for (const key of normalizeIdentityKeys(identityKeys)) {
    const id = getPersistedSellerSolicitudId(key);
    if (id != null) return id;
  }
  return null;
}

/**
 * @param {string | null | undefined} userKey
 * @param {number|string|null|undefined} id
 */
export function persistSellerSolicitudId(userKey, id) {
  const key = normalizeUserKey(userKey);
  if (!key) return;
  if (id == null || id === '') {
    localStorage.removeItem(persistStorageKey(key));
    return;
  }
  localStorage.setItem(persistStorageKey(key), String(id));
}

/**
 * @param {Array<string | null | undefined>} identityKeys
 * @param {number|string|null|undefined} id
 */
export function persistSellerSolicitudIdForIdentities(identityKeys, id) {
  for (const key of normalizeIdentityKeys(identityKeys)) {
    persistSellerSolicitudId(key, id);
  }
}

function resolveUserKey(explicitUserKey) {
  if (explicitUserKey) return explicitUserKey;
  const { sub } = profileClaimsFromToken(getAccessToken());
  return sub;
}

/**
 * @param {number|string|null|undefined} id
 * @param {string | null | undefined} [userKey]
 * @param {Array<string | null | undefined>} [extraIdentityKeys]
 */
export function setSellerSolicitudIdSession(id, userKey, extraIdentityKeys = []) {
  const resolvedUser = resolveUserKey(userKey);
  const keys = normalizeIdentityKeys([resolvedUser, ...extraIdentityKeys]);

  if (id == null || id === '') {
    sessionStorage.removeItem(SELLER_SOLICITUD_SESSION_KEY);
    for (const k of keys) persistSellerSolicitudId(k, null);
  } else {
    sessionStorage.setItem(SELLER_SOLICITUD_SESSION_KEY, String(id));
    persistSellerSolicitudIdForIdentities(keys, id);
  }
  window.dispatchEvent(new Event(SELLER_SESSION_CHANGED));
}

/**
 * Limpia solo la sesión de pestaña (logout). La persistencia por usuario se conserva.
 * @param {string | null | undefined} [userKey] si se indica, también borra persistencia de esa clave
 * @param {Array<string | null | undefined>} [extraIdentityKeys]
 */
export function clearSellerSolicitudIdSession(userKey, extraIdentityKeys = []) {
  sessionStorage.removeItem(SELLER_SOLICITUD_SESSION_KEY);
  if (userKey || extraIdentityKeys.length) {
    for (const k of normalizeIdentityKeys([userKey, ...extraIdentityKeys])) {
      persistSellerSolicitudId(k, null);
    }
  }
  window.dispatchEvent(new Event(SELLER_SESSION_CHANGED));
}
