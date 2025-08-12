import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true, // Enable global APIs (describe, it, expect, vi, etc.)
    environment: 'node', // Or 'jsdom' if testing DOM-related code
    include: ['tests/**/*.{test,spec}.?(c|m)[jt]s?(x)'], // Include test files in the 'tests' directory
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'], // lcov is key for SonarQube
      exclude: ['dist/', 'node_modules/', '**/*.d.ts']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src') // Configure path alias for '@/...'
    }
  }
});
