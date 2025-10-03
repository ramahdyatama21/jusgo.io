import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          charts: ['recharts'],
          router: ['react-router-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    minify: 'esbuild',
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets'
  },
  css: {
    devSourcemap: false
  },
  define: {
    __REACT_DEVTOOLS_GLOBAL_HOOK__: 'undefined',
    'process.env.NODE_ENV': '"production"'
  },
  esbuild: {
    drop: ['console', 'debugger']
  }
})