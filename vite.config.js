import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import json from '@rollup/plugin-json';

export default defineConfig({
  plugins: [
    react(),
    json({
      preferConst: true,
      compact: true,
      namedExports: true
    })
  ],
  optimizeDeps: {
    include: ['firebase']
  },
  build: {
    rollupOptions: {
      plugins: [json()]
    }
  }
});

