import { defineConfig } from 'oxlint'
import {
  a11yDisabledRules,
  disabledRules,
  reactDisabledRules,
} from './disabled.ts'
import { eslintRules } from './eslint.ts'
import { importRules } from './import.ts'
import { jsdocRules } from './jsdoc.ts'
import { nodeRules } from './node.ts'
import { onlyExportComponents, reactRules } from './react.ts'
import { typeAwareRules, typescriptRules } from './typescript.ts'
import { unicornRules } from './unicorn.ts'
import { TEST_FILES, testRules } from './vitest.ts'
import type { OxlintConfig } from 'oxlint'

import type { LintPlugins, OxlintOptions } from './types.ts'

export type { OxlintOptions } from './types.ts'

/**
 * The shared oxlint config.
 *
 * Consume it through `extends`, which merges first to last, so a repo only
 * writes what differs:
 *
 * ```ts
 * // oxlint.config.ts
 * import { defineConfig } from 'oxlint'
 * import { oxlint } from '@debbl/oxc-config'
 *
 * export default defineConfig({
 *   extends: [oxlint({ react: true, next: true })],
 *   ignorePatterns: ['content/**\/*.md'],
 * })
 * ```
 */
export function oxlint(options: OxlintOptions = {}): OxlintConfig {
  const {
    react: enableReact = false,
    next: enableNext = false,
    a11y: enableA11y = false,
    node: enableNode = true,
    jsdoc: enableJsdoc = true,
    test: enableTest = true,
    typeAware: enableTypeAware = false,
    plugins: extraPlugins = [],
  } = options

  // `next` and `a11y` are meaningless without the React rules underneath.
  const react = enableReact || enableNext || enableA11y

  const plugins: LintPlugins = [
    // oxlint's own defaults, listed because `plugins` replaces them rather
    // than adding to them.
    'eslint',
    'typescript',
    'unicorn',
    'oxc',
    'import',
    ...(enableNode ? (['node'] as const) : []),
    ...(enableJsdoc ? (['jsdoc'] as const) : []),
    ...(enableTest ? (['vitest'] as const) : []),
    ...(react ? (['react'] as const) : []),
    ...(enableA11y ? (['jsx-a11y'] as const) : []),
    ...(enableNext ? (['nextjs'] as const) : []),
    ...extraPlugins,
  ]

  return defineConfig({
    plugins,
    categories: {
      correctness: 'error',
      suspicious: 'warn',
    },
    rules: {
      ...eslintRules,
      ...importRules,
      ...typescriptRules,
      ...unicornRules,
      ...(enableNode ? nodeRules : {}),
      ...(enableJsdoc ? jsdocRules : {}),
      ...(enableTypeAware ? typeAwareRules : {}),
      ...(react
        ? {
            ...reactRules,
            ...onlyExportComponents(enableNext),
            ...reactDisabledRules,
          }
        : {}),
      ...(enableA11y ? a11yDisabledRules : {}),
      ...disabledRules,
    },
    ...(enableTypeAware ? { options: { typeAware: true } } : {}),
    overrides: [
      {
        // Scripts and CLIs print for a living.
        files: ['scripts/**/*', 'cli.*'],
        rules: {
          'eslint/no-console': 'off',
        },
      },
      {
        // Generated declaration files re-declare and re-import freely.
        files: ['**/*.d.ts'],
        rules: {
          'eslint/no-unused-vars': 'off',
          'import/no-duplicates': 'off',
        },
      },
      ...(enableTest ? [{ files: TEST_FILES, rules: testRules }] : []),
    ],
  })
}
