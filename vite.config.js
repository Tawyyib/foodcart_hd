import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => ({

  // Project root
  root: '.',

  // Base public path (use './' for relative paths so it works from file://)
  base: './',

  // Dev server configuration
  server: {
    port: 5174,
    open: true,
    host: '0.0.0.0',
    strictPort: false,
  },

  // preview server configuration
  preview: {
    port: 4173,
    open: true,
    host: '0.0.0.0',
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    manifest: true,
    sourcemap: mode === 'development',  // Helpful for debugging
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main:     resolve(__dirname, 'index.html'),
        header:     resolve(__dirname, 'header.html'),
        footer:     resolve(__dirname, 'footer.html'),
        catalog:     resolve(__dirname, 'catalogue.html'),
        search:      resolve(__dirname, 'search.html'),
        cart:     resolve(__dirname, 'cart.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        header: resolve(__dirname, 'header.html'),
        footer:    resolve(__dirname, 'footer.html'),
        search: resolve(__dirname, 'search.html'),      },
      output: {
        // JS chunks (shared code)
        chunkFileNames: 'assets/js/[name]-[hash].js',
        // JS entry files
        entryFileNames: 'assets/js/[name]-[hash].js',
        // All other assets (CSS, images, fonts, etc.)
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg|webp|avif)$/i.test(name ?? '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.css$/i.test(name ?? '')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (/\.(woff2?|ttf|otf|eot)$/i.test(name ?? '')) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },

  // CSS configuration  
  css: {
    preprocessorOptions: {
      scss: {        
        api: 'modern-compiler',        
        // Suppress deprecation warnings from dependencies
        silenceDeprecations: ['legacy-js-api', 'import'],
        // Optional: Auto-inject variables into scss files via alias
        // additionalData: `@use "@/scss/abstracts/variables" as *;`,
      },
    },
    devSourcemap: true,
  },

  // Path aliases for cleaner imports
  resolve: {
    alias: {
      '@':       resolve(__dirname, 'src'),
      '@scss':   resolve(__dirname, 'src/scss'),
      '@js':     resolve(__dirname, 'src/js'),
      '@images': resolve(__dirname, 'src/assets/images'),
    },
  },

}));