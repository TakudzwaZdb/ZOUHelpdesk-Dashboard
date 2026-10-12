import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During `npm run dev`, Vite serves the app on :5173 and proxies /api
// straight through to the Express backend on :8080 — no CORS needed
// anywhere, in dev or in production (where Express just serves the built
// files directly from frontend/dist).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
