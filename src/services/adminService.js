import axios from 'axios';

const timeout = Number(import.meta.env.VITE_API_TIMEOUT ?? 20000) || 20000;

/**
 * URL base del admin-service.
 * Debe terminar en `/admin` (p. ej. `/api/admin` en CloudFront o dev con proxy Vite).
 * Si VITE_ADMIN_URL apunta solo a `/api`, se deriva desde VITE_API_URL + `/admin`.
 */
function adminBase() {
  const explicit = String(import.meta.env.VITE_ADMIN_URL ?? '').trim().replace(/\/$/, '');
  if (explicit && /\/admin$/i.test(explicit)) {
    return explicit;
  }
  const api = String(import.meta.env.VITE_API_URL ?? '/api').trim().replace(/\/$/, '');
  return `${api}/admin`;
}

/**
 * @param {unknown} data
 * @param {string} resourceLabel
 * @returns {unknown[]}
 */
function assertJsonArray(data, resourceLabel) {
  if (Array.isArray(data)) return data;
  if (typeof data === 'string' && /<(?:!DOCTYPE|html)/i.test(data)) {
    throw new Error(
      `${resourceLabel}: la URL de admin devolvió HTML del frontend. Configure VITE_ADMIN_URL como …/api/admin.`,
    );
  }
  throw new Error(`${resourceLabel}: respuesta inesperada del admin-service (se esperaba un arreglo JSON).`);
}

export async function listarParametros() {
  const { data } = await axios.get(`${adminBase()}/parametros`, { timeout });
  return assertJsonArray(data, 'Parámetros');
}

export async function actualizarParametro(clave, valor) {
  const { data } = await axios.put(
    `${adminBase()}/parametros/${encodeURIComponent(clave)}`,
    { valor },
    { timeout },
  );
  return data;
}

export async function listarAuditoria() {
  const { data } = await axios.get(`${adminBase()}/auditoria`, { timeout });
  return assertJsonArray(data, 'Auditoría');
}

export async function listarLogsError() {
  const { data } = await axios.get(`${adminBase()}/logs-error`, { timeout });
  return assertJsonArray(data, 'Logs de error');
}
