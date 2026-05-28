import { profileClaimsFromToken } from '../utils/jwtPayload.js';
import {
  getPersistedSellerSolicitudIdFromIdentities,
  getSellerSolicitudIdFromSession,
  normalizeIdentityKeys,
  setSellerSolicitudIdSession,
} from './sellerSession.js';
import { buscarSolicitudDelUsuario, getSolicitud } from '../services/sellerService.js';
import { findUsuarioByIdentity } from '../services/userService.js';

/**
 * @param {number|string} id
 * @param {string[]} identityKeys
 */
async function verificarPersistencia(id, identityKeys) {
  try {
    const solicitud = await getSolicitud(id);
    setSellerSolicitudIdSession(solicitud.id ?? id, identityKeys[0], identityKeys.slice(1));
    return solicitud;
  } catch {
    return null;
  }
}

/**
 * Restaura el id de solicitud del vendedor tras login o al entrar a /seller.
 * @param {string | null | undefined} accessToken
 * @param {{ email?: string | null; username?: string | null; loginUsername?: string | null; force?: boolean }} [options]
 */
export async function recoverSellerSolicitudSession(accessToken, options = {}) {
  const { email: emailOpt, username: usernameOpt, loginUsername, force = false } = options;
  if (!accessToken && !emailOpt && !usernameOpt && !loginUsername) return null;

  const claims = profileClaimsFromToken(accessToken);
  const username = usernameOpt ?? claims.sub;
  const email = emailOpt ?? claims.email;

  const identityKeys = normalizeIdentityKeys([username, loginUsername, email]);

  if (!force) {
    const sessionId = getSellerSolicitudIdFromSession();
    if (sessionId != null) return { id: sessionId };
  }

  const persistedId = getPersistedSellerSolicitudIdFromIdentities(identityKeys);
  if (persistedId != null) {
    const solicitud = await verificarPersistencia(persistedId, identityKeys);
    if (solicitud) return solicitud;
  }

  const profile = await findUsuarioByIdentity({ username, email: email ?? loginUsername });
  const profileKeys = normalizeIdentityKeys([
    ...identityKeys,
    profile?.nombreUsuario,
    profile?.email,
    profile?.documentoIdentidad,
  ]);

  const persistedAfterProfile = getPersistedSellerSolicitudIdFromIdentities(profileKeys);
  if (persistedAfterProfile != null && persistedAfterProfile !== persistedId) {
    const solicitud = await verificarPersistencia(persistedAfterProfile, profileKeys);
    if (solicitud) return solicitud;
  }

  const match = await buscarSolicitudDelUsuario({
    email: email ?? profile?.email ?? loginUsername,
    username: username ?? profile?.nombreUsuario,
    documentoIdentidad: profile?.documentoIdentidad,
  });

  if (match?.id != null) {
    setSellerSolicitudIdSession(match.id, profileKeys[0], profileKeys.slice(1));
    try {
      return await getSolicitud(match.id);
    } catch {
      return match;
    }
  }

  return null;
}
