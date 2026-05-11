import axios from 'axios';

function analyticsBase() {
  return (import.meta.env.VITE_ANALYTICS_URL ?? '/api/analytics').replace(/\/$/, '');
}

/**
 * KPIs del analytics-service (BAM demo). Proxy Vite: `/api/analytics` → puerto 9009.
 */
export async function obtenerKpis() {
  const { data } = await axios.get(`${analyticsBase()}/kpis`, { timeout: 15000 });
  return data;
}

const TIPOS_EVENTO_VALIDOS = /** @type {const} */ (['COMPRA', 'SOLICITUD_APROBADA', 'CONSULTA_CATALOGO']);

/**
 * Registra consulta de catálogo u otra métrica (alimenta HU-23 / tendencias).
 * Fallos de red se ignoran (best-effort).
 * @param {{ tipo: string; referencia: string; valorMonetario?: number }} req referencia ≤120 chars
 */
export async function registrarEventoMetrica(req) {
  const tipoRaw = String(req?.tipo ?? '').trim();
  const tipo = TIPOS_EVENTO_VALIDOS.includes(tipoRaw) ? tipoRaw : 'CONSULTA_CATALOGO';
  let referencia = String(req?.referencia ?? '').trim().slice(0, 120);
  if (!referencia) referencia = 'vista:sin-referencia';

  const body = { tipo, referencia };
  const vm = Number(req?.valorMonetario);
  if (req?.valorMonetario != null && Number.isFinite(vm) && vm >= 0) {
    body.valorMonetario = vm;
  }
  try {
    await axios.post(`${analyticsBase()}/eventos`, body, {
      timeout: 8000,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    /* storefront: analítica opcional */
  }
}
