import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';

// El editor gráfico vive dentro del repo (packages/oasis-designer) y se compila desde su código fuente.
const oasisDesignerAlias = resolve(__dirname, 'packages/oasis-designer/src/lib.ts');

export default defineConfig({
  base: '/', // <--- DEBE SER '/' PARA QUE REACT ROUTER FUNCIONE EN SUBRUTAS COMO /login o /obs-overlay
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      // Permite cachear chunks > 2 MiB en el SW (el bundle principal supera ese límite)
      workbox: {
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4 MiB
      },
      manifest: {
        name: 'Oasis Ecosystem',
        short_name: 'Oasis',
        description: 'Ecosistema Digital Oasis',
        theme_color: '#5b2ea6',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      'react': resolve(__dirname, 'node_modules/react'),
      'react-dom': resolve(__dirname, 'node_modules/react-dom'),
      'react/jsx-runtime': resolve(__dirname, 'node_modules/react/jsx-runtime'),
      'react/jsx-dev-runtime': resolve(__dirname, 'node_modules/react/jsx-dev-runtime'),
      'react-router-dom': resolve(__dirname, 'node_modules/react-router-dom'),
      '@oasis/designer': oasisDesignerAlias,
    },
    dedupe: ['react', 'react-dom', 'framer-motion'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
    exclude: ['@oasis/designer'],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      }
    }
  }
});
