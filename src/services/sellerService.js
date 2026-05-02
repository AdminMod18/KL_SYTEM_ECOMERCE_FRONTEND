import { apiClient } from '../api/apiClient.js';

/**
 * Listado tipo panel director (sin adjuntos). Filtros opcionales se envían como query params.
 * @param {Record<string, string | undefined>} [filtros] solicitudId, documentoIdentidad, estado, creadoDesde, creadoHasta (ISO-8601), q
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function getSolicitudes(filtros = {}) {
  const params = {};
  for (const [k, v] of Object.entries(filtros)) {
    if (v !== '' && v != null) {
      params[k] = v;
    }
  }
  const { data } = await apiClient.get('/solicitudes', { params });
  return Array.isArray(data) ? data : [];
}

/**
 * @param {number|string} id
 * @param {import('axios').AxiosRequestConfig} [config] p. ej. `{ signal }` para cancelar GET obsoletos
 */
export async function getSolicitud(id, config) {
  const cfg = config ?? {};
  /** Evita respuestas `304`/caché del navegador que dejen el estado desactualizado tras un POST. */
  const mergedParams = { ...(cfg.params || {}), _nocache: Date.now() };
  const { data } = await apiClient.get(`/solicitudes/${encodeURIComponent(String(id))}`, {
    ...cfg,
    params: mergedParams,
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      ...cfg.headers,
    },
  });
  return data;
}

/**
 * Payload alineado a {@code SolicitudCreateRequest} del solicitud-service.
 * @param {{
 *   nombreVendedor?: string;
 *   nombres: string;
 *   apellidos: string;
 *   documentoIdentidad: string;
 *   correoElectronico: string;
 *   paisResidencia: string;
 *   ciudadResidencia: string;
 *   telefono: string;
 *   tipoPersona: 'NATURAL' | 'JURIDICA';
 *   adjuntos: Array<{ tipo: string; nombreArchivo: string; contenidoBase64?: string }>;
 * }} payload
 */
export async function createSolicitud(payload) {
  const { data } = await apiClient.post('/solicitudes', payload);
  return data;
}

/**
 * POST validacion automatica (CIFIN simulado + Datacrédito vía validation-service).
 * Modo A: `contenidoArchivoCifin` (líneas plano). Modo B: `documento` + `score` (entero).
 * Opcional: `exigenciaJudicial` = REQUERIDO | NO_REQUERIDO (HU-07, panel Director).
 * @param {number|string} id
 * @param {{
 *   documento?: string;
 *   score?: number;
 *   contenidoArchivoCifin?: string;
 *   exigenciaJudicial?: string;
 * }} payload
 */
export async function validarSolicitud(id, payload) {
  const body = {};
  const cifin = payload.contenidoArchivoCifin != null ? String(payload.contenidoArchivoCifin).trim() : '';
  if (cifin) {
    body.contenidoArchivoCifin = cifin;
  } else {
    const documento = String(payload.documento ?? '').trim();
    const scoreRaw = Number(payload.score);
    if (!documento) {
      throw new Error('documento es obligatorio si no envías contenidoArchivoCifin');
    }
    if (!Number.isFinite(scoreRaw)) {
      throw new Error('score debe ser un numero finito');
    }
    body.documento = documento;
    body.score = Math.trunc(scoreRaw);
  }
  const ej = payload.exigenciaJudicial != null ? String(payload.exigenciaJudicial).trim() : '';
  if (ej) body.exigenciaJudicial = ej;
  const path = `/solicitudes/${encodeURIComponent(String(id))}/validacion-automatica`;
  const { data } = await apiClient.post(path, body);
  return data;
}

/**
 * @param {number|string} id
 * @param {Record<string, unknown>} payload tipo ONLINE | CONSIGNACION + campos de pago
 */
export async function activarSolicitud(id, payload) {
  const { data } = await apiClient.post(`/solicitudes/${id}/activacion-vendedor`, payload);
  return data;
}

/**
 * Renovación de suscripción (ACTIVA o EN_MORA). Mismo contrato de pago que {@link activarSolicitud}.
 * @param {number|string} id
 * @param {Record<string, unknown>} payload tipo ONLINE | CONSIGNACION | TARJETA + campos de pago
 */
export async function renovarSuscripcion(id, payload) {
  const { data } = await apiClient.post(`/solicitudes/${id}/renovar-suscripcion`, payload);
  return data;
}
