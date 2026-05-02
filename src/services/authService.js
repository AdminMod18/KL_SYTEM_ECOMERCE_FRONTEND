import { apiClient } from '../api/apiClient.js';
import { setSession } from '../auth/authStorage.js';
import { clearSellerSolicitudIdSession, setSellerSolicitudIdSession } from '../auth/sellerSession.js';

/**
 * @param {{ username: string; password: string }} creds
 * @returns {Promise<{ accessToken: string; tokenType: string; expiresInSeconds: number; roles: string[] }>}
 */
export async function login(creds) {
  const { data } = await apiClient.post('/auth/login', {
    username: creds.username,
    password: creds.password,
  });
  clearSellerSolicitudIdSession();
  setSession({ accessToken: data.accessToken, roles: data.roles ?? [] });
  window.dispatchEvent(new Event('auth:changed'));
  return data;
}

/**
 * Renueva JWT y roles en localStorage (tras activar tienda vendedor, etc.). Requiere Bearer actual aún válido.
 */
export async function refreshSession() {
  const { data } = await apiClient.post('/auth/refresh', {});
  setSession({ accessToken: data.accessToken, roles: data.roles ?? [] });
  window.dispatchEvent(new Event('auth:changed'));
  return data;
}

/**
 * Tras ACTIVA: fuerza promoción VENDEDOR en user-service según documento/correo de la solicitud y renueva JWT.
 * @param {number} solicitudId
 */
export async function sincronizarVendedorDesdeSolicitud(solicitudId) {
  const { data } = await apiClient.post('/auth/sincronizar-vendedor', { solicitudId });
  setSession({ accessToken: data.accessToken, roles: data.roles ?? [] });
  setSellerSolicitudIdSession(solicitudId);
  window.dispatchEvent(new Event('auth:changed'));
  return data;
}
