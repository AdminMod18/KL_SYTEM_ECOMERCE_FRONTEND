import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { registerApiLoadingHooks } from '../api/loadingBridge.js';
import { GlobalLoader } from '../components/GlobalLoader.jsx';

const LoadingContext = createContext(null);

/**
 * Contador de peticiones HTTP activas (axios). Varias en paralelo → un solo overlay hasta que todas terminen.
 * `setLoading(true|false)` es un candado manual opcional (p. ej. acciones sin axios) que se suma al indicador global.
 */
export function LoadingProvider({ children }) {
  const [apiPending, setApiPending] = useState(0);
  const [manualLock, setManualLock] = useState(false);

  useEffect(() => {
    const begin = () => setApiPending((c) => c + 1);
    const end = () => setApiPending((c) => Math.max(0, c - 1));
    registerApiLoadingHooks({ begin, end });
    return () => {
      registerApiLoadingHooks({
        begin: () => {},
        end: () => {},
      });
      setApiPending(0);
    };
  }, []);

  const setLoading = useCallback((busy) => {
    setManualLock(Boolean(busy));
  }, []);

  const isLoading = apiPending > 0 || manualLock;

  const value = useMemo(
    () => ({
      isLoading,
      /** Candado manual (no modifica el contador de axios). */
      setLoading,
      /** Solo lectura: peticiones axios en curso (útil para depurar). */
      apiPendingCount: apiPending,
    }),
    [isLoading, setLoading, apiPending],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <GlobalLoader visible={isLoading} />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    throw new Error('useLoading debe usarse dentro de LoadingProvider');
  }
  return ctx;
}
