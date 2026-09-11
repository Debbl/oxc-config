import type { Rules } from './types.ts'

/**
 * Ported from the `test` section of `@debbl/eslint-config`. `no-only-tests`
 * came from `eslint-plugin-no-only-tests` there; oxlint's equivalent is
 * `vitest/no-focused-tests`.
 */
export const testRules: Rules = {
  'vitest/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }],
  'vitest/no-focused-tests': 'error',
  'vitest/no-identical-title': 'error',
  'vitest/no-import-node-test': 'error',
  'vitest/prefer-hooks-in-order': 'error',
  'vitest/prefer-lowercase-title': 'error',
  // Assertions are the point of a test file.
  'eslint/no-unused-expressions': 'off',
}

/** `GLOB_TESTS` from `@debbl/eslint-config`. */
export const TEST_FILES = [
  '**/__tests__/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}',
  '**/*.{spec,test,bench,benchmark}.{js,jsx,mjs,cjs,ts,tsx,mts,cts}',
]
