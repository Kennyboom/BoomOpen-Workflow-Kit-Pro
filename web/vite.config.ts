import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sitePlugin } from './build/site-plugin'

/** Hashed build output lives here so hosting can cache it immutably (see vercel.json). */
const HASHED_ASSETS_DIR = 'static'

function resolveManualChunk(id: string): string | undefined {
  const normalized = id.replace(/\\/g, '/')
  if (!normalized.includes('/node_modules/')) {
    return undefined
  }
  if (
    /\/node_modules\/(?:react|react-dom|react-router|react-router-dom|scheduler)\//.test(normalized)
  ) {
    return 'react-vendor'
  }
  if (/\/node_modules\/(?:framer-motion|motion-dom|motion-utils)\//.test(normalized)) {
    return 'motion-vendor'
  }
  if (/\/node_modules\/lucide-react\//.test(normalized)) {
    return 'icons-vendor'
  }
  return undefined
}

export default defineConfig({
  plugins: [react(), tailwindcss(), sitePlugin()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    assetsDir: HASHED_ASSETS_DIR,
    rollupOptions: {
      output: {
        manualChunks: resolveManualChunk,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
