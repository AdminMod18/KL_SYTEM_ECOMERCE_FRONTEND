import { apiClient } from '../api/apiClient.js';

/**
 * @param {number|string} productoId
 */
export async function listInteraccionesProducto(productoId) {
  const pid = encodeURIComponent(String(productoId));
  const { data } = await apiClient.get(`/productos/${pid}/interacciones`, {
    skipGlobalLoading: true,
    params: { _nocache: Date.now() },
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
  });
  return Array.isArray(data) ? data : [];
}

/**
 * @param {number|string} productoId
 * @param {{ tipo: 'PREGUNTA' | 'COMENTARIO'; contenido: string; autorNombre?: string }} body
 */
export async function crearInteraccionProducto(productoId, body) {
  const { data } = await apiClient.post(`/productos/${productoId}/interacciones`, body);
  return data;
}

/**
 * @param {number|string} productoId
 * @param {number|string} interaccionId
 * @param {{ respuesta: string }} body
 */
export async function responderInteraccionProducto(productoId, interaccionId, body) {
  const { data } = await apiClient.put(`/productos/${productoId}/interacciones/${interaccionId}/respuesta`, body);
  return data;
}
