import { defineConfig } from 'oxlint'
import type { OxlintConfig } from 'oxlint'

// oxlint exports the config type but not the plugin-list type, so derive it.
type LintPlugins = NonNullable<OxlintConfig['plugins']>

export interface OxlintOptions {
  /**
   * React rules, including the React Compiler ones oxlint runs natively.
   *
   * @default false
   */
  react?: boolean
  /**
   * Next.js rules. Implies `react`.
   *
   * @default false
   */
  next?: boolean
  /**
   * `jsx-a11y` rules. Implies `react`.
   *
   * @default false
   */
  a11y?: boolean
  /**
   * Rules that only make sense for code that runs on Node.
   *
   * @default true
   */
  node?: boolean
  /**
   * JSDoc rules.
   *
   * @default true
   */
  jsdoc?: boolean
  /**
   * Extra plugins on top of what the options above turn on.
   *
   * @default []
   */
  plugins?: LintPlugins
}

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
      // None of these were part of `@debbl/eslint-config`, and each fires on
      // something legitimate: framework globals (`__SW_MANIFEST`,
      // `__NEXT_PRIVATE_ORIGIN`), side-effect imports (`import './x.css'`),
      // and shadowing that reads fine in callbacks.
      'eslint/no-shadow': 'off',
      'eslint/no-underscore-dangle': 'off',
      'import/no-unassigned-import': 'off',
      ...(react
        ? {
            // React 17+ automatic JSX runtime: no `React` in scope needed.
            // Left on, this fires once per JSX element in the codebase.
            'react/react-in-jsx-scope': 'off',
          }
        : {}),
      ...(enableA11y
        ? {
            // Wrong for the two cases it actually catches: inline
            // `<svg role='img'>` (the recommended pattern, not something to
            // swap for `<img>`) and satori trees, which are not the DOM.
            'jsx-a11y/prefer-tag-over-role': 'off',
          }
        : {}),
    },
  })
}
