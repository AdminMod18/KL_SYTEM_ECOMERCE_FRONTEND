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

/**
 * Registra consulta de catálogo u otra métrica (alimenta HU-23 / tendencias).
 * Fallos de red se ignoran (best-effort).
 * @param {{ tipo: string; referencia: string; valorMonetario?: number }} req referencia ≤120 chars
 */
export async function registrarEventoMetrica(req) {
  const body = {
    tipo: req.tipo,
    referencia: String(req.referencia ?? '').slice(0, 120),
  };
  const vm = Number(req.valorMonetario);
  if (req.valorMonetario != null && Number.isFinite(vm)) {
    body.valorMonetario = vm;
  }
  try {
    await axios.post(`${analyticsBase()}/eventos`, body, { timeout: 8000 });
  } catch {
    /* storefront: analítica opcional */
  }
}
