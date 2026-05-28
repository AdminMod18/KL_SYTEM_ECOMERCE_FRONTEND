import { profileClaimsFromToken } from '../utils/jwtPayload.js';
import { getSellerSolicitudIdFromSession, setSellerSolicitudIdSession } from './sellerSession.js';
import { buscarSolicitudDelUsuario } from '../services/sellerService.js';

/**
 * Restaura el id de solicitud del vendedor tras login o al entrar a /seller.
 * @param {string | null | undefined} accessToken
 * @param {{ email?: string | null; username?: string | null; force?: boolean }} [options]
 */
export async function recoverSellerSolicitudSession(accessToken, options = {}) {
  const { email: emailOpt, username: usernameOpt, force = false } = options;
  if (!accessToken && !emailOpt && !usernameOpt) return null;

  if (!force && getSellerSolicitudIdFromSession() != null) {
    return { id: getSellerSolicitudIdFromSession() };
  }

  const claims = profileClaimsFromToken(accessToken);
  const email = emailOpt ?? claims.email;
  const username = usernameOpt ?? claims.sub;
  const match = await buscarSolicitudDelUsuario({ email, username });
  if (match?.id != null) {
    setSellerSolicitudIdSession(match.id);
    return match;
  }
  return null;
}
