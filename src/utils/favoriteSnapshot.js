/** Campos mínimos para tarjetas y persistencia en favoritos. */
export function favoriteSnapshotFromProduct(p) {
  if (!p || p.id == null) return null;
  return {
    id: p.id,
    nombre: p.nombre ?? '',
    precio: p.precio,
    sku: p.sku?.trim?.() ? p.sku.trim() : `SKU-${p.id}`,
    rutaCategoria: p.rutaCategoria ?? '',
    imagenesUrls: p.imagenesUrls ?? '',
  };
}
