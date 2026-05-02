/** Clave compartida con el panel de onboarding (sessionStorage). */
export const SELLER_SOLICITUD_SESSION_KEY = 'kl_seller_solicitud_id';

/** Disparar tras cambiar id en sesión para que otras vistas actualicen el mismo tab. */
export const SELLER_SESSION_CHANGED = 'kl:seller-solicitud-session';

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
 * @param {number|string|null|undefined} id
 */
export function setSellerSolicitudIdSession(id) {
  if (id == null || id === '') {
    sessionStorage.removeItem(SELLER_SOLICITUD_SESSION_KEY);
  } else {
    sessionStorage.setItem(SELLER_SOLICITUD_SESSION_KEY, String(id));
  }
  window.dispatchEvent(new Event(SELLER_SESSION_CHANGED));
}

export function clearSellerSolicitudIdSession() {
  sessionStorage.removeItem(SELLER_SOLICITUD_SESSION_KEY);
  window.dispatchEvent(new Event(SELLER_SESSION_CHANGED));
}
