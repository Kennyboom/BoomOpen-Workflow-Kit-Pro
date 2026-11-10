import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sitePlugin } from './build/site-plugin'

/** Hashed build output lives here so hosting can cache it immutably (see vercel.json). */
const HASHED_ASSETS_DIR = 'static'

export default defineConfig({
  plugins: [react(), tailwindcss(), sitePlugin()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    assetsDir: HASHED_ASSETS_DIR,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'animation-vendor': ['framer-motion'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
