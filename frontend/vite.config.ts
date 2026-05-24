import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',      // Required for Docker — bind to all interfaces
    port: 5173,
    strictPort: true,
    // Allow Render.com preview/deployment hosts in addition to localhost
    allowedHosts: ['.onrender.com'],
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: ['.onrender.com'],
  },
})
