import type { Rules } from './types.ts'

/**
 * `@debbl/eslint-config` builds its React layer out of `eslint-react` and
 * `react-refresh`; oxlint ports the same checks under `eslint-plugin-react`
 * names, so these are the renames plus the handful `categories` misses.
 */
export const reactRules: Rules = {
  // `react-hooks/rules-of-hooks`
  'react/rules-of-hooks': 'error',
  // `react/no-array-index-key`
  'react/no-array-index-key': 'warn',
  // `react/no-clone-element`
  'react/no-clone-element': 'warn',
  // `react/no-redundant-should-component-update`
  'react/no-redundant-should-component-update': 'error',
  // `react-dom/no-dangerously-set-innerhtml`
  'react/no-danger': 'warn',
}

// https://github.com/ArnaudBarre/eslint-plugin-react-refresh/issues/102
const TANSTACK_HOCS = [
  'createFileRoute',
  'createLazyFileRoute',
  'createRootRoute',
  'createRootRouteWithContext',
  'createLink',
  'createRoute',
  'createLazyRoute',
]

// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
const NEXT_EXPORT_NAMES = [
  'experimental_ppr',
  'dynamic',
  'dynamicParams',
  'revalidate',
  'fetchCache',
  'runtime',
  'preferredRegion',
  'maxDuration',
  'metadata',
  'generateMetadata',
  'viewport',
  'generateViewport',
  'generateImageMetadata',
  'generateSitemaps',
  'generateStaticParams',
]

/**
 * `react-refresh/only-export-components`. The TanStack HOCs are on by default
 * in `@debbl/eslint-config`; the Next.js route segment exports only when `next`
 * is set. Note oxlint spells the option `customHOCs`, not react-refresh's
 * `extraHOCs`.
 */
export function onlyExportComponents(next: boolean): Rules {
  return {
    'react/only-export-components': [
      'warn',
      {
        allowConstantExport: true,
        customHOCs: TANSTACK_HOCS,
        ...(next ? { allowExportNames: NEXT_EXPORT_NAMES } : {}),
      },
    ],
  }
}
