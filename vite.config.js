import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large vendor libraries into separate chunks
          'vendor-xlsx': ['xlsx'],
          'vendor-jspdf': ['jspdf', 'jspdf-autotable'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'vendor-react': ['react', 'react-dom', 'react-router-dom']
        }
      }
    },
    // Increase warning limit since we have lazy loading
    chunkSizeWarningLimit: 600
  }
})
