import { defineConfig } from 'vite'

// GitHub Pages serve il sito sotto /nautica/, quindi la base non e' la radice.
export default defineConfig({
  base: process.env.BASE ?? '/nautica/',
  build: { target: 'es2022', assetsInlineLimit: 0 }
})
