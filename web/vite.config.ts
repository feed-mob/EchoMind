import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['xo8k8g0wwkg8o8w40wsgs08w.184.73.145.124.sslip.io'],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    allowedHosts: ['xo8k8g0wwkg8o8w40wsgs08w.184.73.145.124.sslip.io'],
  },
})
