import type { Rules } from './types.ts'

/**
 * The syntax-only half of `@debbl/eslint-config`'s TypeScript config. The rules
 * it turns on through `@typescript-eslint`'s `strict` preset that oxlint files
 * under `correctness` are already on; these are the rest.
 */
export const typescriptRules: Rules = {
  'typescript/ban-ts-comment': [
    'error',
    { 'ts-expect-error': 'allow-with-description' },
  ],
  'typescript/consistent-type-definitions': ['error', 'interface'],
  'typescript/consistent-type-imports': [
    'error',
    {
      disallowTypeAnnotations: false,
      fixStyle: 'separate-type-imports',
      prefer: 'type-imports',
    },
  ],
  'typescript/method-signature-style': ['error', 'property'],
  'typescript/no-empty-object-type': ['error', { allowInterfaces: 'always' }],
  'typescript/no-import-type-side-effects': 'error',
  'typescript/no-namespace': 'error',
  'typescript/no-non-null-asserted-nullish-coalescing': 'error',
  'typescript/no-require-imports': 'error',
  'typescript/no-unsafe-function-type': 'error',
  'typescript/prefer-literal-enum-member': 'error',

  // `suspicious` in oxlint, an error there.
  'typescript/no-unnecessary-type-constraint': 'error',
}

/**
 * The type-aware half, which `@debbl/eslint-config` only turns on when handed a
 * `tsconfigPath`. The ones oxlint already files under `correctness`
 * (`no-floating-promises`, `await-thenable`, `unbound-method`, ...) are left
 * out - they are on either way, and simply do not fire until `--type-aware`
 * gives them types to work with.
 */
export const typeAwareRules: Rules = {
  'typescript/no-misused-promises': 'error',
  'typescript/no-unnecessary-type-assertion': 'error',
  'typescript/no-unsafe-argument': 'error',
  'typescript/no-unsafe-assignment': 'error',
  'typescript/no-unsafe-call': 'error',
  'typescript/no-unsafe-member-access': 'error',
  'typescript/no-unsafe-return': 'error',
  'typescript/promise-function-async': 'error',
  'typescript/restrict-plus-operands': 'error',
  'typescript/return-await': ['error', 'in-try-catch'],
  'typescript/strict-boolean-expressions': [
    'error',
    { allowNullableBoolean: true, allowNullableObject: true },
  ],
  'typescript/switch-exhaustiveness-check': 'error',
}
