import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'], // lcov is key for SonarQube
      exclude: ['dist/', 'node_modules/', '**/*.d.ts']
    }
  }
});
