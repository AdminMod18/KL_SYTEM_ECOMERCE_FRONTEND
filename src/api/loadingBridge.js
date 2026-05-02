/**
 * Puente entre axios (módulo sin hooks) y React (LoadingProvider).
 * Evita dependencias circulares: apiClient → loadingBridge; LoadingProvider registra callbacks aquí.
 */

let onBegin = () => {};
let onEnd = () => {};

/**
 * @param {{ begin: () => void; end: () => void }} hooks
 */
export function registerApiLoadingHooks(hooks) {
  onBegin = hooks.begin;
  onEnd = hooks.end;
}

/**
 * @param {import('axios').InternalAxiosRequestConfig | undefined} config
 */
export function apiLoadingBegin(config) {
  if (!config || config.skipGlobalLoading) return;
  config.__globalLoadingTracked = true;
  onBegin();
}

/**
 * @param {import('axios').InternalAxiosRequestConfig | undefined} config
 */
export function apiLoadingEnd(config) {
  if (!config?.__globalLoadingTracked) return;
  delete config.__globalLoadingTracked;
  onEnd();
}
