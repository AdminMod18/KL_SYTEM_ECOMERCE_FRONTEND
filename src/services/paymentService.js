import { apiClient } from '../api/apiClient.js';
import { getRequestErrorMessage } from '../utils/apiError.js';

/** Token mágico del payment-service (ONLINE): respuesta 201 con estado DECLINADO. */
export const TOKEN_SIMULAR_RECHAZO = 'tok_simular_rechazo';

/** Referencia de cobro alineada con la orden persistida. */
export function referenciaClienteOrden(ordenId) {
  return `ORDEN-${ordenId}`;
}

function montoDesdeOrden(orden) {
  const monto = Number(orden.total);
  if (!Number.isFinite(monto) || monto < 0.01) {
    throw new Error('Total de orden inválido para el pago.');
  }
  return monto;
}

/**
 * Respuesta con estado de negocio de rechazo (p. ej. pasarela ONLINE simulada).
 * @param {Record<string, unknown>|null|undefined} pago
 */
export function isPagoRechazadoPorNegocio(pago) {
  if (!pago || typeof pago.estado !== 'string') return false;
  return pago.estado.trim().toUpperCase() === 'DECLINADO';
}

/**
 * @param {Record<string, unknown>|null|undefined} pago
 */
export function mensajePagoRechazado(pago) {
  const m = pago?.mensaje;
  if (typeof m === 'string' && m.trim()) return m.trim();
  return 'La pasarela o el banco rechazó la operación.';
}

/**
 * Mensaje para banner PAGO_FALLIDO: prioriza rechazo DECLINADO con texto claro.
 * @param {unknown} err
 */
export function getMensajeFalloPago(err) {
  if (err && typeof err === 'object' && err.isPagoDeclinado === true && typeof err.message === 'string') {
    return err.message.trim();
  }
  return getRequestErrorMessage(err);
}

/**
 * POST /pagos sin rechazo por status: si el JSON incluye estado DECLINADO, siempre es fallo de negocio.
 * @param {Record<string, unknown>} body
 */
function normalizePagoExitosoVacío(data, requestBody) {
  const tipo =
    requestBody && typeof requestBody === 'object' && requestBody.tipo != null
      ? String(requestBody.tipo)
      : 'CONSIGNACION';
  return {
    estado: 'RECIBIDO',
    mensaje:
      typeof data === 'string' && data.trim()
        ? data.trim()
        : 'Pago registrado correctamente (respuesta sin JSON del servidor).',
    tipo,
    idTransaccion: null,
  };
}

async function postPago(body) {
  const res = await apiClient.post('/pagos', body, {
    validateStatus: () => true,
    skipGlobalLoading: true,
  });
  const data = res.data;

  if (data != null && typeof data === 'object' && !Array.isArray(data) && isPagoRechazadoPorNegocio(data)) {
    const detalle = mensajePagoRechazado(data);
    const err = new Error(`El pago fue rechazado (DECLINADO). ${detalle}`);
    err.isPagoDeclinado = true;
    err.pagoPayload = data;
    throw err;
  }

  if (res.status >= 200 && res.status < 300) {
    if (data != null && typeof data === 'object' && !Array.isArray(data)) {
      return data;
    }
    return normalizePagoExitosoVacío(data, body);
  }

  const err = new Error(`Request failed with status code ${res.status}`);
  err.response = {
    status: res.status,
    statusText: res.statusText,
    data: res.data,
    headers: res.headers,
    config: res.config,
  };
  err.config = res.config;
  throw err;
}

/**
 * @param {{ monto: number | string; referenciaCliente: string; numeroComprobanteConsignacion: string }} params
 */
export async function payConsignacion(params) {
  return postPago({
    tipo: 'CONSIGNACION',
    monto: params.monto,
    referenciaCliente: params.referenciaCliente,
    numeroComprobanteConsignacion: params.numeroComprobanteConsignacion,
  });
}

/**
 * @param {{ ordenId: number|string; total: number|string }} orden respuesta de `POST /orden`
 */
export async function pagarOrdenConsignacion(orden) {
  const ordenId = orden.ordenId;
  const referenciaCliente = referenciaClienteOrden(ordenId);
  const monto = montoDesdeOrden(orden);
  return payConsignacion({
    monto,
    referenciaCliente,
    numeroComprobanteConsignacion: `WEB-${ordenId}-${Date.now()}`,
  });
}

/**
 * @param {{ ordenId: number|string; total: number|string }} orden
 * @param {string} tokenPasarela
 */
export async function pagarOrdenOnline(orden, tokenPasarela) {
  const ordenId = orden.ordenId;
  const referenciaCliente = referenciaClienteOrden(ordenId);
  const monto = montoDesdeOrden(orden);
  const tok = String(tokenPasarela ?? '').trim();
  if (!tok) {
    throw new Error('tokenPasarela es obligatorio para pagos ONLINE.');
  }
  return payOnline({
    monto,
    referenciaCliente,
    tokenPasarela: tok,
  });
}

/**
 * @param {{ monto: number | string; referenciaCliente: string; tokenPasarela: string }} params
 */
export async function payOnline(params) {
  return postPago({
    tipo: 'ONLINE',
    monto: params.monto,
    referenciaCliente: params.referenciaCliente,
    tokenPasarela: params.tokenPasarela,
  });
}
