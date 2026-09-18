import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  server: { port: 3030 },
  preview: { port: 3030 },
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [fileURLToPath(new URL('./src/util/ui', import.meta.url))]
      }
    }
  }
})
