import { defineConfig } from 'oxfmt'
import type { GlobSet, OxfmtConfig } from 'oxfmt'

export interface OxfmtOptions {
  /**
   * Sort Tailwind class lists. Pass the v4 entry stylesheet - that is what
   * defines the class order now that there is no JS config - or `true` to let
   * oxfmt find the installed Tailwind's `theme.css`.
   *
   * @default false
   */
  tailwind?: boolean | string
  /**
   * Extra glob patterns to leave alone, on top of the generated files every
   * repo has.
   *
   * @default []
   */
  ignorePatterns?: GlobSet
  /**
   * Escape hatch for anything this wrapper does not spell out. Merged last,
   * so it wins.
   *
   * @default {}
   */
  overrides?: OxfmtConfig
}

/**
 * The shared oxfmt config. oxfmt has no `extends`, so this returns the whole
 * config and takes the per-repo bits as options:
 *
 * ```ts
 * // oxfmt.config.ts
 * import { oxfmt } from '@debbl/oxc-config'
 *
 * export default oxfmt({
 *   tailwind: './src/styles/tailwindcss/index.css',
 *   ignorePatterns: ['content/**\/*.md'],
 * })
 * ```
 */
export function oxfmt(options: OxfmtOptions = {}): OxfmtConfig {
  const { tailwind = false, ignorePatterns = [], overrides = {} } = options

  return defineConfig({
    // Carried over from the Prettier options the ESLint config used.
    semi: false,
    singleQuote: true,
    jsxSingleQuote: true,
    quoteProps: 'consistent',
    // oxfmt defaults to 100. Prettier's default was 80, which is the width
    // every one of these repos is already wrapped at - leaving it at 100
    // reflows the whole codebase on the first run.
    printWidth: 80,
    sortImports: true,
    ...(tailwind
      ? {
          sortTailwindcss:
            typeof tailwind === 'string' ? { stylesheet: tailwind } : true,
        }
      : {}),
    ignorePatterns: [
      // Written by a tool on every build, in every repo that has them.
      'auto-imports.d.ts',
      'worker-configuration.d.ts',
      'next-env.d.ts',
      'routeTree.gen.ts',
      ...ignorePatterns,
    ],
    ...overrides,
  } satisfies OxfmtConfig)
}
