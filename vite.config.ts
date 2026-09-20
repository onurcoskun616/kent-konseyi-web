import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/kent-konseyi-web/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      // GitHub Pages index.html'i önbelleğe aldığı için, hash'li dosya adları
      // yeni deploy sonrası "önbellekteki eski index.html + artık var olmayan
      // asset" durumuna yol açıp sayfanın bembeyaz açılmasına neden oluyordu.
      // Sabit dosya adlarıyla eski index.html de geçerli bir dosyaya işaret eder.
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
}));
