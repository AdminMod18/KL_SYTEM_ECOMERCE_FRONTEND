/**
 * Roles alineados con JWT emitidos por auth-service / user-service.
 * USER se normaliza como comprador para vistas de tienda.
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  VENDEDOR: 'VENDEDOR',
  COMPRADOR: 'COMPRADOR',
  USER: 'USER',
};

export function normalizeRoles(raw) {
  const upper = (raw ?? []).map((r) => String(r).trim().toUpperCase()).filter(Boolean);
  const set = new Set(upper);
  if (set.has(ROLES.USER) && !set.has(ROLES.COMPRADOR)) {
    set.add(ROLES.COMPRADOR);
  }
  return [...set];
}

export function hasAnyRole(userRoles, required) {
  if (!required?.length) return true;
  const have = new Set(normalizeRoles(userRoles));
  return required.some((r) => have.has(String(r).toUpperCase()));
}

export function isAdmin(userRoles) {
  return hasAnyRole(userRoles, [ROLES.ADMIN]);
}

export function isVendedor(userRoles) {
  return hasAnyRole(userRoles, [ROLES.VENDEDOR]);
}

export function isComprador(userRoles) {
  return hasAnyRole(userRoles, [ROLES.COMPRADOR, ROLES.USER]);
}
