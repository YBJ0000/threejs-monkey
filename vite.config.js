import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      }
    }
  },
  publicDir: 'public',
  base: './'
})