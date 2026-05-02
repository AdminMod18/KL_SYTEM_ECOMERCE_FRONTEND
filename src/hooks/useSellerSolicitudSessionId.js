import { useEffect, useState } from 'react';
import {
  getSellerSolicitudIdFromSession,
  SELLER_SESSION_CHANGED,
} from '../auth/sellerSession.js';

/**
 * Id de solicitud de vendedor guardado en esta pestaña (onboarding / sincronización).
 */
export function useSellerSolicitudSessionId() {
  const [id, setId] = useState(() => getSellerSolicitudIdFromSession());

  useEffect(() => {
    const sync = () => setId(getSellerSolicitudIdFromSession());
    window.addEventListener('auth:changed', sync);
    window.addEventListener(SELLER_SESSION_CHANGED, sync);
    return () => {
      window.removeEventListener('auth:changed', sync);
      window.removeEventListener(SELLER_SESSION_CHANGED, sync);
    };
  }, []);

  return id;
}
