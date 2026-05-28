import { apiClient } from '../api/apiClient.js';

/**
 * Caso estudio §7: `nombres` + `apellidos` (y opcional `nombreCompleto` legacy). Dirección y redes opcionales.
 * `password`: user-service la persiste como BCrypt para login vía auth-service (interno).
 */
export async function createUsuario(payload) {
  const { data } = await apiClient.post('/usuarios', payload);
  return data;
}

/**
 * Busca el perfil del usuario autenticado por nombre de usuario o correo.
 * @param {{ username?: string | null; email?: string | null }} identity
 */
export async function findUsuarioByIdentity({ username, email }) {
  try {
    const { data } = await apiClient.get('/usuarios');
    const list = Array.isArray(data) ? data : [];
    const norm = (v) => String(v ?? '').trim().toLowerCase();
    const userNorm = norm(username);
    const mailNorm = norm(email);

    if (userNorm) {
      const byUser = list.find((u) => norm(u.nombreUsuario) === userNorm);
      if (byUser) return byUser;
    }
    if (mailNorm) {
      const byMail = list.find((u) => norm(u.email) === mailNorm);
      if (byMail) return byMail;
    }
    return null;
  } catch {
    return null;
  }
}
