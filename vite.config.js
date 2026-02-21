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
          'vendor-exceljs': ['exceljs'],
          'vendor-jspdf': ['jspdf', 'jspdf-autotable'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-jszip': ['jszip'],
          'vendor-charts': ['chart.js', 'react-chartjs-2'],
          'vendor-pdf': ['pdfjs-dist'],
          'vendor-docx': ['mammoth']
        }
      }
    },
    sourcemap: 'hidden',
    chunkSizeWarningLimit: 500
  }
})
