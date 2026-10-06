import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The dev server proxies API and WebSocket traffic to the backend,
// so the browser only ever talks to one origin (no CORS in dev).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
      '/socket.io': { target: 'ws://localhost:4000', ws: true },
    },
  },
});
