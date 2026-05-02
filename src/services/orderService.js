import { apiClient } from '../api/apiClient.js';

/**
 * @param {{
 *   clienteId: string;
 *   tipoEntrega?: 'DOMICILIO' | 'RECOGIDA';
 *   paisEnvio?: string;
 *   ciudadEnvio?: string;
 *   direccionEnvio?: string;
 *   lineas: Array<{ sku: string; cantidad: number; precioUnitario: number }>;
 * }} payload
 */
export async function createOrden(payload) {
  const { data } = await apiClient.post('/orden', payload);
  return data;
}

/**
 * Historial de pedidos del comprador (HU-20).
 * @param {string} clienteId mismo valor usado en checkout
 */
export async function listOrdenesPorCliente(clienteId) {
  /** /ordenes evita 405 en despliegues que solo reenviaban POST a /orden. El backend acepta ambas rutas. */
  const { data } = await apiClient.get('/ordenes', {
    params: { clienteId, _nocache: Date.now() },
    skipGlobalLoading: true,
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
  });
  return Array.isArray(data) ? data : [];
}
