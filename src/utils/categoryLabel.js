/** Primera parte de rutaCategoria en mayúsculas (p. ej. Audio/Premium → AUDIO) */
export function categoryLabelFromPath(rutaCategoria) {
  if (!rutaCategoria || typeof rutaCategoria !== 'string') return '';
  const first = rutaCategoria.split('/')[0].trim();
  return first ? first.toUpperCase() : '';
}
