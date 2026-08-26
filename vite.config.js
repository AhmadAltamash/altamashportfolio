import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'

dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split heavy, independently-cacheable libraries into their own
        // chunks instead of one giant bundle. A returning visitor who
        // hasn't touched Firebase-dependent code, for example, can reuse
        // that cached chunk even after an app-code deploy.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
})
