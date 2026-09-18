import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/inv/' : '/',
  server: { port: 3030 },
  plugins: [react()]
}))
