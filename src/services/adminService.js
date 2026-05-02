import axios from 'axios';

const timeout = Number(import.meta.env.VITE_API_TIMEOUT ?? 20000) || 20000;

/** Proxy Vite en dev: `/api/admin` → admin-service:9010 (`/admin/...`). */
function adminBase() {
  return (import.meta.env.VITE_ADMIN_URL ?? '/api/admin').replace(/\/$/, '');
}

export async function listarParametros() {
  const { data } = await axios.get(`${adminBase()}/parametros`, { timeout });
  return data;
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
  return data;
}

export async function listarLogsError() {
  const { data } = await axios.get(`${adminBase()}/logs-error`, { timeout });
  return data;
}
