import { apiClient } from '../api/apiClient.js';

/**
 * Caso estudio §7: `nombres` + `apellidos` (y opcional `nombreCompleto` legacy). Dirección y redes opcionales.
 * `password`: user-service la persiste como BCrypt para login vía auth-service (interno).
 */
export async function createUsuario(payload) {
  const { data } = await apiClient.post('/usuarios', payload);
  return data;
}
