import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'MicroApp',
      fileName: (format) => `micro-app.${format}.js`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['tslib'],
    }
  }
});