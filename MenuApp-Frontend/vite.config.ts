import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    hmr: {
      overlay: true
    },
    watch: {
      ignored: ['**/node_modules/**', '**/.git/**', '**/MenuApp-Backend/**'],
      // Native ReadDirectoryChangesW goes through Intel RST/Optane and has
      // crashed this PC. Polling stays in user mode.
      usePolling: true,
      interval: 2000
    },
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      },
      // HTTP polling fallback only. Never proxy WebSockets here:
      // Vite HMR also uses WS, and ws:true on Windows can storm reconnects.
      '/socket.io': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        ws: false
      }
    }
  }
})
