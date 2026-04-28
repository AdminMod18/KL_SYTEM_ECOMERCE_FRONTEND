import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';

/** Catálogo demo alineado a los ítems destacados del prototipo Figma Make */
export const MOCK_PRODUCTOS = [
  {
    id: 'f1',
    nombre: 'Premium Wireless Headphones',
    precio: 899,
    descripcion: 'Industry-leading noise cancellation and spatial audio.',
    rutaCategoria: 'Audio/Premium',
  },
  {
    id: 'f2',
    nombre: 'Luxury Smart Watch',
    precio: 1299,
    descripcion: 'Precision health metrics with titanium finish.',
    rutaCategoria: 'Wearables',
  },
  {
    id: 'f3',
    nombre: 'Professional Camera Kit',
    precio: 4599,
    descripcion: 'Full-frame sensor with pro lenses included.',
    rutaCategoria: 'Photography',
  },
  {
    id: 'f4',
    nombre: 'MacBook Pro M3 Max',
    precio: 14999,
    descripcion: 'Power for creators. Silent thermal design.',
    rutaCategoria: 'Computing',
  },
  {
    id: 'f5',
    nombre: 'iPhone 15 Pro Titanium',
    precio: 5699,
    descripcion: 'A17 Pro chip. Titanium design. Pro camera system.',
    rutaCategoria: 'Mobile',
  },
  {
    id: 'f6',
    nombre: 'Premium AirPods Max',
    precio: 2399,
    descripcion: 'Computational audio. Stainless steel frame.',
    rutaCategoria: 'Audio',
  },
];

function mapProductos(data) {
  return (Array.isArray(data) ? data : []).map((p) => ({
    id: String(p.id),
    nombre: p.nombre,
    precio: Number(p.precio),
    descripcion: p.descripcion,
    rutaCategoria: p.rutaCategoria,
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
      const { data } = await api.get('/productos');
      const mapped = mapProductos(data);
      setProductos(mapped.length ? mapped : MOCK_PRODUCTOS);
    } catch {
      setProductos(MOCK_PRODUCTOS);
      setError('');
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
        const { data } = await api.get('/productos');
        if (!cancel) {
          const mapped = mapProductos(data);
          setProductos(mapped.length ? mapped : MOCK_PRODUCTOS);
        }
      } catch {
        if (!cancel) {
          setProductos(MOCK_PRODUCTOS);
          setError('');
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
