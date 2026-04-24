import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // Build optimization
  build: {
    // Output directory
    outDir: 'dist',
    
    // Generate sourcemaps for debugging (disable in production if needed)
    sourcemap: false,
    
    // Chunk size warning limit (500kb)
    chunkSizeWarningLimit: 1000,
    
    // Rollup options for optimization
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three'],
          'animation-vendor': ['framer-motion'],
          'state-vendor': ['zustand'],
        },
      },
    },
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: true,
  },
  
  // Development server configuration
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
})
