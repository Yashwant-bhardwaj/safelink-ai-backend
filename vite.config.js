import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    react({
      // Babel transform optimization
      babel: {
        plugins: [],
      },
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  build: {
    // Target modern browsers for smaller output
    target: 'es2020',

    // Chunk size warning at 600KB
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal caching
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI/Animation
          'framer': ['framer-motion'],

          // Charts (heavy)
          'charts': ['recharts'],

          // AI chat (heavy)
          'chat-vendor': [
            'react-markdown',
            'remark-gfm',
            'react-syntax-highlighter',
          ],

          // Form validation
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],

          // Data fetching
          'query-vendor': ['@tanstack/react-query', 'axios'],

          // UI utilities
          'ui-vendor': ['lucide-react', 'clsx', 'tailwind-merge', 'react-hot-toast'],
        },
      },
    },

    // Enable minification
    minify: 'esbuild',

    // Source maps only in development
    sourcemap: false,
  },

  // Development server proxy (avoids CORS issues during dev)
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },

  // Optimized dependency pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'axios',
      '@tanstack/react-query',
      'lucide-react',
      'react-hot-toast',
      'react-markdown',
      'remark-gfm',
    ],
  },
})
