import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Prefijo único en dev: el cliente usa baseURL `/api` y cada regla reescribe al path real del microservicio. */
const microProxy = (port, pathPrefix) => ({
  target: `http://127.0.0.1:${port}`,
  changeOrigin: true,
  rewrite: (p) => p.replace(new RegExp(`^/api/${pathPrefix}`), `/${pathPrefix}`),
});

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/auth': microProxy(9001, 'auth'),
      '/api/usuarios': microProxy(9002, 'usuarios'),
      '/api/productos': microProxy(9007, 'productos'),
      '/api/orden': microProxy(9006, 'orden'),
      '/api/ordenes': microProxy(9006, 'ordenes'),
      '/api/pagos': microProxy(9005, 'pagos'),
      '/api/solicitudes': microProxy(9003, 'solicitudes'),
      '/api/analytics': {
        target: 'http://127.0.0.1:9009',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/analytics/, ''),
      },
      '/api/admin': {
        target: 'http://127.0.0.1:9010',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/admin/, '/admin'),
      },
    },
  },
});
