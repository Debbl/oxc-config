import type { Rules } from './types.ts'

/**
 * None of these were part of `@debbl/eslint-config`, and each fires on
 * something legitimate: framework globals (`__SW_MANIFEST`,
 * `__NEXT_PRIVATE_ORIGIN`), side-effect imports (`import './x.css'`), and
 * shadowing that reads fine in callbacks.
 */
export const disabledRules: Rules = {
  'eslint/no-shadow': 'off',
  'eslint/no-underscore-dangle': 'off',
  'import/no-unassigned-import': 'off',
}

export const reactDisabledRules: Rules = {
  // React 17+ automatic JSX runtime: no `React` in scope needed. Left on, this
  // fires once per JSX element in the codebase.
  'react/react-in-jsx-scope': 'off',
}

export const a11yDisabledRules: Rules = {
  // Wrong for the two cases it actually catches: inline `<svg role='img'>`
  // (the recommended pattern, not something to swap for `<img>`) and satori
  // trees, which are not the DOM.
  'jsx-a11y/prefer-tag-over-role': 'off',
}
