import { apiClient } from '../api/apiClient.js';

/**
 * Listado de catálogo. `skipGlobalLoading` evita el overlay global (skeleton local).
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function listProductos() {
  const { data } = await apiClient.get('/productos', { skipGlobalLoading: true });
  return Array.isArray(data) ? data : [];
}

/**
 * @param {Record<string, unknown>} payload campos base + opcionales caso estudio §4 (marca, subcategoria, condicion, imagenesUrls, …)
 */
export async function createProducto(payload) {
  const { data } = await apiClient.post('/productos', payload);
  return data;
}

/**
 * Inventario del vendedor (solicitud ACTIVA).
 * @param {number|string} vendedorSolicitudId
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function listProductosPorVendedor(vendedorSolicitudId) {
  const { data } = await apiClient.get('/productos', {
    params: { vendedorSolicitudId },
    skipGlobalLoading: true,
  });
  return Array.isArray(data) ? data : [];
}

/**
 * @param {number|string} productoId
 * @param {{ vendedorSolicitudId: number|string; cantidadStock: number }} payload
 */
export async function updateProductoStock(productoId, payload) {
  const { data } = await apiClient.patch(`/productos/${productoId}/stock`, payload);
  return data;
}
