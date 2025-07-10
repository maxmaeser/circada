import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        menubar: path.resolve(__dirname, 'menubar.html'),
      },
    },
  },
  server: {
    port: 1420,
    strictPort: true,
  },
  css: {
    postcss: './postcss.config.cjs'
  }
})
