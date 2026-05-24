import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';
import { existsSync } from 'fs';

// Usa el paquete real si la ruta existe (dev con el monorepo completo),
// de lo contrario usa el stub incluido en este repo.
const externalDesignerSrc = resolve(__dirname, '../../bases para dev/editor grafico/AdminAnnouncements/packages/oasis-designer/src');
const oasisDesignerAlias = existsSync(externalDesignerSrc)
  ? resolve(externalDesignerSrc, 'lib.ts')
  : resolve(__dirname, 'src/stubs/oasis-designer/index.jsx');

export default defineConfig({
  base: './', // <--- 🌟 ¡ESTA ES LA LÍNEA MÁGICA PARA QUE HOSTINGER NO SE QUEDE EN BLANCO!
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
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    },
    fs: {
      allow: [
        // Allow serving files from the frontend root
        '.',
        // Allow serving files from the external designer package
        resolve(__dirname, '../../bases para dev/editor grafico/AdminAnnouncements/packages/oasis-designer')
      ]
    }
  }
});
