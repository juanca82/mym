import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist',
  },
  server: {
    host: true, // Permite acceder desde la red local
    port: 5173, // Puerto por defecto
  },
  preview: {
    port: 4173,
  },
});