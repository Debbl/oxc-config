import type { OxlintConfig } from 'oxlint'

/** oxlint exports the config type but not these two, so derive them. */
export type LintPlugins = NonNullable<OxlintConfig['plugins']>
export type Rules = NonNullable<OxlintConfig['rules']>

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
   * Vitest rules, scoped to test files.
   *
   * @default true
   */
  test?: boolean
  /**
   * Rules that need type information, the `--type-aware` ones. Needs
   * `oxlint-tsgolint` installed alongside oxlint.
   *
   * @default false
   */
  typeAware?: boolean
  /**
   * Extra plugins on top of what the options above turn on.
   *
   * @default []
   */
  plugins?: LintPlugins
}
