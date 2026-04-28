import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], cantidad: copy[idx].cantidad + 1 };
        return copy;
      }
      return [...prev, { ...product, cantidad: 1 }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateQty = useCallback((id, cantidad) => {
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, cantidad: Math.max(1, cantidad) } : p)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const total = useMemo(
    () => items.reduce((acc, p) => acc + Number(p.precio) * p.cantidad, 0),
    [items],
  );

  const value = useMemo(
    () => ({ items, addItem, removeItem, updateQty, clear, total }),
    [items, addItem, removeItem, updateQty, clear, total],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider');
  return ctx;
}
