import type { Rules } from './types.ts'

/** Ported from the `imports` section of `@debbl/eslint-config`. */
export const importRules: Rules = {
  'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
  'import/first': 'error',
  'import/newline-after-import': ['error', { count: 1 }],
  'import/no-duplicates': 'error',
  'import/no-mutable-exports': 'error',
  'import/no-named-default': 'error',
  'import/no-webpack-loader-syntax': 'error',

  // `suspicious` in oxlint, an error there.
  'import/no-self-import': 'error',
}
