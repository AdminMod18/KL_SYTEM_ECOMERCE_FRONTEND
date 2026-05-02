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
    const { data } = await apiClient.get(`/solicitudes/${sid}/reputacion-resumen`, {
      skipGlobalLoading: true,
      params: { _nocache: Date.now() },
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
    });
    if (data != null && typeof data.totalCalificaciones === 'number') {
      return data;
    }
    return { ...vacio, solicitudId: data?.solicitudId ?? vacio.solicitudId };
  } catch (e) {
    if (e.response?.status === 404) {
      return vacio;
    }
    throw e;
  }
}
