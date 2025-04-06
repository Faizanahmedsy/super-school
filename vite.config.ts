import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/nsc-app-testing',
  define: {
    'process.env': {},
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: fileURLToPath(new URL('./src', import.meta.url)),
      },
      {
        find: 'app',
        replacement: fileURLToPath(new URL('./src/app', import.meta.url)),
      },
      {
        // Add Popper.js resolution
        find: '@popperjs/core',
        replacement: path.resolve(__dirname, 'node_modules/@popperjs/core'),
      },
    ],
  },
  optimizeDeps: {
    include: ['@popperjs/core'],
  },
});
