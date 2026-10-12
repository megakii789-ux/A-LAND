import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/domain/**/*.test.ts', 'src/tests/**/*.test.ts', 'src/tests/**/*.test.tsx'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
});
