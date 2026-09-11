import type { Rules } from './types.ts'

/**
 * Ported from the `jsdoc` section of `@debbl/eslint-config`. Seven of its
 * sixteen rules - `check-param-names`, `check-types`, `check-alignment`,
 * `multiline-blocks`, `no-multi-asterisks`, `require-returns-check`,
 * `require-yields-check` - oxlint does not implement.
 */
export const jsdocRules: Rules = {
  'jsdoc/check-access': 'warn',
  'jsdoc/empty-tags': 'warn',
  'jsdoc/require-param-name': 'warn',
  'jsdoc/require-returns-description': 'warn',
}
