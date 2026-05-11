/**
 * Separa solo entre imágenes, no la coma de `data:...;base64,<payload>`.
 * @type {RegExp}
 */
const COMA_ENTRE_IMAGENES = /,(?=(?:data:|https?:))/i;

/**
 * Convierte el valor guardado en `productos.imagenes_urls` (o texto del formulario) en lista de URLs/data URLs.
 * - Nuevo: varias entradas separadas por salto de línea.
 * - Antiguo: URLs https separadas por coma.
 * - Antiguo roto: varias data URLs unidas solo por `,data:` — se recupera con el mismo regex.
 *
 * @param {string|null|undefined} raw
 * @returns {string[]}
 */
export function parseImagenesUrlsCadena(raw) {
  if (raw == null || String(raw).trim() === '') return [];
  const s = String(raw).trim();
  if (/\r|\n/.test(s)) {
    return s
      .split(/\r?\n/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  const partes = s.split(COMA_ENTRE_IMAGENES).map((x) => x.trim()).filter(Boolean);
  if (partes.length >= 1) return partes;
  return [];
}
