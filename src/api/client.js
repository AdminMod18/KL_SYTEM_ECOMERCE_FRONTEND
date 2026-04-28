import axios from 'axios';

/**
 * Cliente HTTP compartido (Axios) con baseURL configurable por entorno.
 * VITE_API_URL: URL base de los microservicios o un API Gateway.
 */
const baseURL = import.meta.env.VITE_API_URL ?? '';

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
