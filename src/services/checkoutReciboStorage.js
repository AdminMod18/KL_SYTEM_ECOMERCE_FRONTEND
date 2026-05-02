const KEY = 'marketplace_checkout_recibo_v1';

/**
 * @param {{ orden: unknown; pago: unknown; referenciaCliente: string }} data
 */
export function saveCheckoutRecibo(data) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...data, savedAt: Date.now() }));
  } catch {
    /* modo privado / cuota */
  }
}

/** @returns {{ orden: unknown; pago: unknown; referenciaCliente: string; savedAt?: number } | null} */
export function readCheckoutRecibo() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearCheckoutRecibo() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
