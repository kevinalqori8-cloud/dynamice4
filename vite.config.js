// vite.config.js - Tambahan config untuk prevent chunk errors
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          'motion-vendor': ['framer-motion'],
          'firebase-vendor': ['firebase/app', 'firebase/firestore', 'firebase/storage'],
        },
      },
    },
  },
  // Prevent chunk loading issues
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@mui/material', 'framer-motion']
  }
})

