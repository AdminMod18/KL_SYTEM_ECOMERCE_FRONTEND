import { apiClient } from '../api/apiClient.js';

function resumenVacio(solicitudId) {
  const n = Number(solicitudId);
  return {
    solicitudId: Number.isFinite(n) ? n : null,
    totalCalificaciones: 0,
    promedioValor: null,
  };
}

/**
 * @param {number|string} solicitudId
 * @returns {Promise<{ solicitudId: number | null; totalCalificaciones: number; promedioValor: number | null }>}
 */
export async function getReputacionResumen(solicitudId) {
  const sid = encodeURIComponent(String(solicitudId));
  const vacio = resumenVacio(solicitudId);
  try {
    const res = await apiClient.get(`/solicitudes/${sid}/reputacion-resumen`, {
      skipGlobalLoading: true,
      params: { _nocache: Date.now() },
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
      /** Evita reject de axios en 404/502: el backend nuevo devuelve 200; versiones viejas o proxy pueden devolver 404. */
      validateStatus: (status) =>
        (status >= 200 && status < 300) || status === 404 || status === 502 || status === 503 || status === 504,
    });

    if (res.status === 404 || res.status === 502 || res.status === 503 || res.status === 504) {
      return vacio;
    }

    const data = res.data;
    if (data != null && typeof data === 'object' && typeof data.totalCalificaciones === 'number') {
      const prom =
        data.promedioValor != null
          ? Number(data.promedioValor)
          : data.promedio != null
            ? Number(data.promedio)
            : null;
      return {
        solicitudId: data.solicitudId ?? vacio.solicitudId,
        totalCalificaciones: data.totalCalificaciones,
        promedioValor: Number.isFinite(prom) ? prom : null,
      };
    }
    return { ...vacio, solicitudId: data?.solicitudId ?? vacio.solicitudId };
  } catch {
    return vacio;
  }
}

/**
 * Registra una calificación al vendedor (1–10 en servidor). La UI usa 5 estrellas → 2,4,6,8,10.
 * Requiere solicitud del vendedor en estado ACTIVA o EN_MORA (regla del backend).
 *
 * @param {number|string} solicitudId
 * @param {{ valor: number; comentario?: string; referenciaOrden?: string }} body
 */
export async function postCalificacionVendedor(solicitudId, body) {
  const sid = encodeURIComponent(String(solicitudId));
  const { data } = await apiClient.post(`/solicitudes/${sid}/calificaciones-vendedor`, body, {
    skipGlobalLoading: true,
  });
  return data;
}
