import type { Rules } from './types.ts'

/** Ported from the `unicorn` section of `@debbl/eslint-config`. */
export const unicornRules: Rules = {
  'unicorn/consistent-empty-array-spread': 'error',
  'unicorn/error-message': 'error',
  'unicorn/escape-case': 'error',
  'unicorn/new-for-builtins': 'error',
  'unicorn/no-new-buffer': 'error',
  'unicorn/prefer-dom-node-text-content': 'error',
  'unicorn/prefer-includes': 'error',
  'unicorn/prefer-node-protocol': 'error',
  'unicorn/prefer-number-properties': 'error',
  'unicorn/prefer-type-error': 'error',
  'unicorn/throw-new-error': 'error',

  // `suspicious` in oxlint, errors there.
  'unicorn/consistent-function-scoping': [
    'error',
    { checkArrowFunctions: false },
  ],
  'unicorn/no-instanceof-builtins': 'error',
}
