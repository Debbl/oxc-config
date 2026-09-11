import type { Rules } from './types.ts'

/**
 * Core rules `@debbl/eslint-config` turns on that oxlint implements but files
 * under `style` / `restriction` / `pedantic`, so `categories` alone never
 * reaches them. Names and options are ported one-to-one.
 */
export const eslintRules: Rules = {
  'eslint/accessor-pairs': [
    'error',
    { enforceForClassMembers: true, setWithoutGet: true },
  ],
  'eslint/array-callback-return': 'error',
  'eslint/default-case-last': 'error',
  'eslint/eqeqeq': ['error', 'smart'],
  'eslint/new-cap': [
    'error',
    { capIsNew: false, newIsCap: true, properties: true },
  ],
  'eslint/no-alert': 'error',
  // `@typescript-eslint/no-array-constructor`, `/no-redeclare` and
  // `/no-use-before-define` in the ESLint config, which turns the core rules
  // off in their favour. oxlint only ships the core ones.
  'eslint/no-array-constructor': 'error',
  'eslint/no-redeclare': ['error', { builtinGlobals: false }],
  'eslint/no-use-before-define': [
    'error',
    { classes: false, functions: false, variables: true },
  ],
  // `unused-imports/no-unused-vars`, which also covers
  // `unused-imports/no-unused-imports`.
  'eslint/no-unused-vars': [
    'error',
    {
      args: 'after-used',
      argsIgnorePattern: '^_',
      vars: 'all',
      varsIgnorePattern: '^_',
    },
  ],
  'eslint/no-case-declarations': 'error',
  'eslint/no-console': ['error', { allow: ['warn', 'error'] }],
  'eslint/no-empty': ['error', { allowEmptyCatch: true }],
  'eslint/no-fallthrough': 'error',
  'eslint/no-labels': ['error', { allowLoop: false, allowSwitch: false }],
  'eslint/no-lone-blocks': 'error',
  'eslint/no-multi-str': 'error',
  'eslint/no-new-func': 'error',
  'eslint/no-new-wrappers': 'error',
  'eslint/no-proto': 'error',
  'eslint/no-prototype-builtins': 'error',
  'eslint/no-regex-spaces': 'error',
  'eslint/no-restricted-globals': [
    'error',
    { name: 'global', message: 'Use `globalThis` instead.' },
    { name: 'self', message: 'Use `globalThis` instead.' },
  ],
  'eslint/no-restricted-properties': [
    'error',
    {
      property: '__proto__',
      message:
        'Use `Object.getPrototypeOf` or `Object.setPrototypeOf` instead.',
    },
    {
      property: '__defineGetter__',
      message: 'Use `Object.defineProperty` instead.',
    },
    {
      property: '__defineSetter__',
      message: 'Use `Object.defineProperty` instead.',
    },
    {
      property: '__lookupGetter__',
      message: 'Use `Object.getOwnPropertyDescriptor` instead.',
    },
    {
      property: '__lookupSetter__',
      message: 'Use `Object.getOwnPropertyDescriptor` instead.',
    },
  ],
  'eslint/no-self-compare': 'error',
  'eslint/no-sequences': 'error',
  'eslint/no-template-curly-in-string': 'error',
  'eslint/no-throw-literal': 'error',
  'eslint/no-unreachable-loop': 'error',
  'eslint/no-useless-call': 'error',
  'eslint/no-useless-computed-key': 'error',
  'eslint/no-useless-return': 'error',
  'eslint/no-var': 'error',
  'eslint/object-shorthand': [
    'error',
    'always',
    { avoidQuotes: true, ignoreConstructors: false },
  ],
  'eslint/one-var': ['error', { initialized: 'never' }],
  'eslint/prefer-const': [
    'error',
    { destructuring: 'all', ignoreReadBeforeAssign: true },
  ],
  'eslint/prefer-exponentiation-operator': 'error',
  'eslint/prefer-promise-reject-errors': 'error',
  'eslint/prefer-regex-literals': [
    'error',
    { disallowRedundantWrapping: true },
  ],
  'eslint/prefer-rest-params': 'error',
  'eslint/prefer-spread': 'error',
  'eslint/prefer-template': 'error',
  'eslint/symbol-description': 'error',
  'eslint/unicode-bom': ['error', 'never'],
  'eslint/vars-on-top': 'error',
  'eslint/yoda': ['error', 'never'],

  // Both configs enable these; the ESLint config is the stricter of the two,
  // where oxlint files them under `suspicious` and this config warns.
  'eslint/block-scoped-var': 'error',
  'eslint/no-extend-native': 'error',
  'eslint/no-extra-bind': 'error',
  'eslint/no-implied-eval': 'error',
  'eslint/no-new': 'error',
  'eslint/no-unmodified-loop-condition': 'error',
  'eslint/no-unneeded-ternary': 'error',
}
