import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': { target: 'http://127.0.0.1:9001', changeOrigin: true },
      '/usuarios': { target: 'http://127.0.0.1:9002', changeOrigin: true },
      '/productos': { target: 'http://127.0.0.1:9007', changeOrigin: true },
      '/orden': { target: 'http://127.0.0.1:9006', changeOrigin: true },
    },
  },
});
