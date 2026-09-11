import { describe, expect, it } from 'vitest'
import { resolve } from './utils.ts'

/**
 * What is left once the assertions that just restate the rule tables in `src/oxlint/` are gone.
 *
 * `resolve` is the whole test: oxlint validates rule names *and* their options
 * and rejects the entire config on the first one it does not recognise, so a
 * rule ported under a name oxlint does not have - or with an option it spells
 * differently, like react-refresh's `extraHOCs` vs oxlint's `customHOCs` -
 * throws here. Whether the rules that came back are the ones written down is
 * not worth asserting: `parity.test.ts` checks them against
 * `@debbl/eslint-config`, and `diagnostics.test.ts` checks they fire.
 */
describe('oxlint accepts every rule name and option', () => {
  const flags = ['react', 'next', 'a11y', 'node', 'jsdoc', 'test', 'typeAware']
  const allOff = Object.fromEntries(flags.map((flag) => [flag, false]))
  const allOn = Object.fromEntries(flags.map((flag) => [flag, true]))

  // Every branch of the config has to reach oxlint at least once, so: nothing
  // on, everything on, and each flag flipped against both.
  it.each([
    allOff,
    allOn,
    ...flags.map((flag) => ({ ...allOff, [flag]: true })),
    ...flags.map((flag) => ({ ...allOn, [flag]: false })),
  ])('%j', (options) => {
    expect(Object.keys(resolve(options).rules).length).toBeGreaterThan(0)
  })

  it('accepts an extra plugin on top', () => {
    expect(resolve({ plugins: ['promise'] }).plugins).toContain('promise')
  })
})
