import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    host: true, // listen on 0.0.0.0 so phones on Wi‑Fi can open the UI
  },
  preview: {
    port: 3001,
    host: true,
  },
  build: {
    outDir: 'dist',
  },
});
