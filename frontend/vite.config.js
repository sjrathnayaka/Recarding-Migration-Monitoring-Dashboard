import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward all /api/* calls to the Spring Boot backend
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: path => path,
      },
    },
  },
})
