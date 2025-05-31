import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true, // Enable polling for file changes
    },
    allowedHosts: ['getintomealprep.de']
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/', // This already covers setupTests.ts if it's in src/test/
        'dist/**',                // Excludes the dist folder
        'eslint.config.js',       // Excludes eslint.config.js at client/eslint.config.js
        'vite.config.ts',         // Excludes this Vite config file itself
        'src/main.tsx',           // Excludes the main application entry point
        'src/vite-env.d.ts',      // Excludes TypeScript definition files
        'src/config/**',          // Excludes all files in the src/config directory
        // Add any other files or patterns you wish to exclude
      ],
    },
  },
});
