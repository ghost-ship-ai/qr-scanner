import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: {
      './qr-scanner-worker.min.js': '/workspace/src/__mocks__/qr-scanner-worker.min.js',
    },
  },
});
