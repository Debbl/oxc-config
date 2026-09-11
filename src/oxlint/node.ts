import type { Rules } from './types.ts'

/**
 * Ported from the `node` section of `@debbl/eslint-config`. The rest of that
 * section - `no-deprecated-api`, `prefer-global/*`, `process-exit-as-throw` -
 * oxlint does not implement.
 */
export const nodeRules: Rules = {
  'node/handle-callback-err': ['error', '^(err|error)$'],
  'node/no-exports-assign': 'error',
  'node/no-new-require': 'error',
  'node/no-path-concat': 'error',
}
