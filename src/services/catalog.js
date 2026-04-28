/**
 * Servicio de catálogo: funciones puras de filtrado y categorías derivadas del listado.
 * Patrón: capa de servicio sin efectos secundarios de red (el fetch vive en hooks).
 */

export function extractCategories(productos) {
  const set = new Set();
  for (const p of productos) {
    const top = String(p.rutaCategoria ?? '').split('/')[0] || 'General';
    set.add(top);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function filterProductos(productos, { categorias, precioMin, precioMax, busqueda }) {
  const q = (busqueda ?? '').trim().toLowerCase();
  return productos.filter((p) => {
    const top = String(p.rutaCategoria ?? '').split('/')[0] || 'General';
    if (categorias?.length && !categorias.includes(top)) return false;
    if (p.precio < precioMin || p.precio > precioMax) return false;
    if (q && !`${p.nombre} ${p.descripcion}`.toLowerCase().includes(q)) return false;
    return true;
  });
}
