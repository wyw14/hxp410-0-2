import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 41002,
    proxy: {
      '/api': {
        target: 'http://localhost:41102',
        changeOrigin: true
      }
    }
  }
})
