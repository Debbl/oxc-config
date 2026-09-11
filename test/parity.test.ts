import { describe, expect, it } from 'vitest'
import parity from './parity.json' with { type: 'json' }
import { resolve, severity } from './utils.ts'

/**
 * Every rule `@debbl/eslint-config@3.17.3` turns on that oxlint implements,
 * keyed by its oxlint name and valued by the name it had there. `base` is what
 * `defineConfig({ typescript: true })` resolved to for a `.ts` file; `react` is
 * what `{ typescript: true, react: { next: true } }` added for a `.tsx` one.
 *
 * This is the one list worth checking in: it says what the *other* config does,
 * so unlike an assertion on the rules object it can fail for a reason worth
 * knowing - a rule dropped in a refactor, or renamed by an oxlint upgrade.
 *
 * Regenerate it against a newer `@debbl/eslint-config` with
 * `eslint --print-config`, not by hand.
 */
const { base, react } = parity

describe('parity with @debbl/eslint-config', () => {
  const withDefaults = resolve()
  const withReact = resolve({ next: true, a11y: true })

  it.each(Object.entries(base))(
    'enables `%s`, which it had as `%s`',
    (rule) => {
      expect(severity(withDefaults, rule)).toBeDefined()
    },
  )

  it.each(Object.entries(react))(
    'enables `%s` under `next`/`a11y`, which it had as `%s`',
    (rule) => {
      expect(severity(withReact, rule)).toBeDefined()
    },
  )

  it('does not silently disable one of them', () => {
    const disabled = [...Object.keys(base), ...Object.keys(react)].filter(
      (rule) => severity(withReact, rule) === 'allow',
    )

    expect(disabled).toEqual([])
  })
})
