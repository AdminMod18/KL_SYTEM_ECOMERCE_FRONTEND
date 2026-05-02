import axios from 'axios';
import { apiLoadingBegin, apiLoadingEnd } from './loadingBridge.js';
import { clearSession, getAccessToken } from '../auth/authStorage.js';
import { clearSellerSolicitudIdSession } from '../auth/sellerSession.js';
import { extractApiErrorMessage } from '../utils/apiError.js';

const timeout = Number(import.meta.env.VITE_API_TIMEOUT ?? 20000) || 20000;

/** `VITE_API_URL`: en dev suele ser `/api` (proxy Vite); en prod, URL absoluta del gateway. */
function resolveBaseURL() {
  const raw = import.meta.env.VITE_API_URL;
  const v = (raw == null || String(raw).trim() === '' ? '/api' : String(raw).trim()).replace(/\/$/, '');
  return v;
}

function resolveRequestUrl(config) {
  if (!config) return '';
  try {
    if (typeof axios.getUri === 'function') {
      return axios.getUri(config);
    }
  } catch {
    /* continuar con fallback */
  }
  const base = (config.baseURL ?? '').replace(/\/$/, '');
  const path = (config.url ?? '').replace(/^\//, '');
  if ((config.url ?? '').startsWith('http')) return config.url;
  return base ? `${base}/${path}` : `/${path}`;
}

function isAuthCredentialRecoveryRequest(config) {
  const raw = resolveRequestUrl(config).toLowerCase();
  try {
    const u = new URL(raw, window.location?.origin ?? 'http://localhost');
    const pathname = (u.pathname || '/').replace(/\/+$/, '') || '/';
    return (
      pathname.endsWith('/auth/login') ||
      pathname.endsWith('/auth/refresh') ||
      pathname.endsWith('/auth/sincronizar-vendedor')
    );
  } catch {
    return /(^|\/)auth\/(login|refresh|sincronizar-vendedor)(\?|#|$)/i.test(raw);
  }
}

function shouldRedirectToLogin() {
  const path = (window.location?.pathname ?? '/').replace(/\/+$/, '') || '/';
  if (path === '/login' || path === '/register') return false;
  return true;
}

/** 401: limpiar sesión y redirigir salvo login o rutas públicas de credenciales. */
function handleSessionUnauthorized(error) {
  const status = error.response?.status;
  if (status !== 401) return;

  const cfg = error.config;
  if (isAuthCredentialRecoveryRequest(cfg)) {
    return;
  }

  clearSession();
  clearSellerSolicitudIdSession();
  window.dispatchEvent(new Event('auth:changed'));

  if (shouldRedirectToLogin()) {
    window.location.replace('/login');
  }
}

export const apiClient = axios.create({
  baseURL: resolveBaseURL(),
  timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    apiLoadingBegin(config);
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    if (error.config) apiLoadingEnd(error.config);
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    apiLoadingEnd(response.config);
    return response;
  },
  (error) => {
    apiLoadingEnd(error.config);
    handleSessionUnauthorized(error);
    error.normalizedMessage = extractApiErrorMessage(error);
    return Promise.reject(error);
  },
);
