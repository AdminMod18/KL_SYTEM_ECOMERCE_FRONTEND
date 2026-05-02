/**
 * Mensaje desde cuerpo de error HTTP (p. ej. Spring problem+json).
 */
function camposValidacionAString(campos) {
  if (campos == null || typeof campos !== 'object') return '';
  const entries = Object.entries(campos).filter(([k]) => k != null);
  if (entries.length === 0) return '';
  return entries.map(([campo, mensaje]) => `${campo}: ${mensaje}`).join('. ');
}

export function extractApiErrorMessage(err) {
  if (!err) return 'Error desconocido';
  if (err.code === 'ECONNABORTED') return 'Tiempo de espera agotado. Intenta de nuevo.';
  const data = err.response?.data;
  if (data == null) return err.message || 'Error de red';
  if (typeof data === 'string') return data;
  const desdeCampos =
    camposValidacionAString(data.campos) || camposValidacionAString(data.properties?.campos);
  if (desdeCampos) return desdeCampos;
  if (data.detail) return String(data.detail);
  if (data.title) return String(data.title);
  if (data.message) return String(data.message);
  if (data.properties?.campos) return JSON.stringify(data.properties.campos);
  if (data.campos) return JSON.stringify(data.campos);
  try {
    return JSON.stringify(data);
  } catch {
    return err.message || 'Error';
  }
}

/**
 * Mensaje para UI: respeta `normalizedMessage` del apiClient y errores lanzados sin `response`.
 */
export function getRequestErrorMessage(err) {
  if (err?.normalizedMessage != null && String(err.normalizedMessage).length > 0) {
    return String(err.normalizedMessage);
  }
  if (err?.message && !err.response) {
    return String(err.message);
  }
  return extractApiErrorMessage(err);
}
