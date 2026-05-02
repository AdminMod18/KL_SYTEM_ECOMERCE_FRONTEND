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

function textoBusquedaProducto(p) {
  return [
    p.nombre,
    p.descripcion,
    p.marca,
    p.subcategoria,
    p.color,
    p.tamano,
    p.rutaCategoria,
    p.condicion,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function filterProductos(productos, { categorias, precioMin, precioMax, busqueda }) {
  const q = (busqueda ?? '').trim().toLowerCase();
  return productos.filter((p) => {
    const top = String(p.rutaCategoria ?? '').split('/')[0] || 'General';
    if (categorias?.length && !categorias.includes(top)) return false;
    if (p.precio < precioMin || p.precio > precioMax) return false;
    if (q && !textoBusquedaProducto(p).includes(q)) return false;
    return true;
  });
}
