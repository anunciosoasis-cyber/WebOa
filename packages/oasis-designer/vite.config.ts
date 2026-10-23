import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/lib.ts'),
      name: 'OasisDesigner',
      fileName: (format) => `oasis-designer.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      // Externalize dependencies that should be provided by the host app
      external: ['react', 'react-dom', 'framer-motion'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'framer-motion': 'FramerMotion'
        },
        // Force css into a single file
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css';
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // Ensure assets like fonts and logos are bundled directly into the JS
    assetsInlineLimit: 1000000, // 1MB
    sourcemap: true,
    emptyOutDir: true
  }
});
