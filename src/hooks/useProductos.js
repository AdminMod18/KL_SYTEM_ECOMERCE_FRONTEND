import { useCallback, useEffect, useState } from 'react';
import { listProductos } from '../services/productService.js';
import { getRequestErrorMessage } from '../utils/apiError.js';

function mapProductos(data) {
  return (Array.isArray(data) ? data : []).map((p) => ({
    id: String(p.id),
    vendedorSolicitudId: p.vendedorSolicitudId != null ? String(p.vendedorSolicitudId) : null,
    sku: `SKU-${p.id}`,
    nombre: p.nombre,
    precio: Number(p.precio),
    descripcion: p.descripcion ?? '',
    rutaCategoria: p.rutaCategoria,
    subcategoria: p.subcategoria ?? '',
    marca: p.marca ?? '',
    color: p.color ?? '',
    tamano: p.tamano ?? '',
    condicion: p.condicion != null ? String(p.condicion) : '',
    cantidadStock: p.cantidadStock,
    imagenesUrls: p.imagenesUrls ?? '',
  }));
}

export function useProductos() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const raw = await listProductos();
      setProductos(mapProductos(raw));
    } catch (err) {
      setProductos([]);
      setError(getRequestErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const raw = await listProductos();
        if (!cancel) {
          setProductos(mapProductos(raw));
        }
      } catch (err) {
        if (!cancel) {
          setProductos([]);
          setError(getRequestErrorMessage(err));
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return { productos, loading, error, reload };
}
