import { expect, it } from 'vitest'
import { resolve } from './utils.ts'
import type { OxlintOptions } from '~/index.ts'

/**
 * The full resolved rule set per preset, the way `@antfu/eslint-config`
 * snapshots its factory output.
 *
 * Nothing here is an assertion about what is correct - it is a record of what
 * the config currently resolves to, so that bumping oxlint shows up in the diff
 * of a pull request instead of silently changing what every repo lints with.
 * Review the diff, then update with `vitest -u`.
 */
function snapshot(name: string, options: OxlintOptions = {}) {
  // The title is the preset name, which `valid-title` cannot see is a string.
  // oxlint-disable-next-line vitest/valid-title
  it(name, async () => {
    const {
      plugins,
      categories,
      rules,
      overrides,
      options: linter,
    } = resolve(options)

    await expect({
      plugins: plugins.toSorted(),
      categories,
      options: linter,
      rules: Object.fromEntries(
        Object.entries(rules).toSorted(([a], [b]) => a.localeCompare(b)),
      ),
      overrides,
    }).toMatchFileSnapshot(`./__snapshots__/${name}.snap`)
  })
}

snapshot('default')
snapshot('react', { react: true })
snapshot('next-a11y', { next: true, a11y: true })
snapshot('type-aware', { typeAware: true })
snapshot('minimal', { node: false, jsdoc: false, test: false })
