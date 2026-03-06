import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['echo-mind.coolify-tinca.tonob.net'],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    allowedHosts: ['echo-mind.coolify-tinca.tonob.net'],
  },

})
