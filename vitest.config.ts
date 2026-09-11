import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // `test/cases/example.test.ts` is a fixture, not a test.
    exclude: [...configDefaults.exclude, 'test/cases/**'],
  },
  resolve: {
    alias: {
      '~': new URL('./src/', import.meta.url).pathname,
    },
  },
})
