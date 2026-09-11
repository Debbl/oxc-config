import { describe, expect, it } from 'vitest'
import { lintCases, rulesFor } from './utils.ts'

/**
 * `resolve` in `oxlint.test.ts` proves oxlint accepts the config. These prove
 * the rules in it actually fire - on real source, at the severity and with the
 * exceptions the ESLint config had.
 */
describe('cases', () => {
  const diagnostics = lintCases()

  it('reports the ported rules on `base.ts`', () => {
    expect(rulesFor(diagnostics, 'base.ts')).toEqual([
      'eslint/eqeqeq',
      'eslint/no-console',
      'eslint/no-throw-literal',
      'eslint/no-var',
      'eslint/prefer-template',
      'import/no-mutable-exports',
      'unicorn/prefer-node-protocol',
    ])
  })

  it('lets `cli.ts` and `scripts/` print', () => {
    expect(rulesFor(diagnostics, 'cli.ts')).toEqual([])
    expect(rulesFor(diagnostics, 'scripts/release.ts')).toEqual([])
  })

  it('leaves generated declaration files alone', () => {
    // `import/no-duplicates` and `no-unused-vars` would both fire here.
    expect(rulesFor(diagnostics, 'generated.d.ts')).toEqual([])
  })

  describe('test files', () => {
    it('reports the vitest rules on `example.test.ts`', () => {
      expect(rulesFor(diagnostics, 'example.test.ts')).toEqual([
        'vitest/consistent-test-it',
        // `test/no-only-tests` in the ESLint config.
        'vitest/no-focused-tests',
        'vitest/prefer-lowercase-title',
      ])
    })

    it('covers `__tests__` as well as `*.test.*`', () => {
      expect(rulesFor(diagnostics, '__tests__/legacy.ts')).toContain(
        'vitest/no-import-node-test',
      )
    })

    it('reports nothing from vitest when `test` is off', () => {
      const withoutTest = lintCases({ test: false })

      expect(
        withoutTest.filter((d) => d.rule.startsWith('vitest/')),
      ).toHaveLength(0)
    })
  })

  describe('react', () => {
    const withReact = lintCases({ react: true })

    it('reports the renamed eslint-react rules on `component.tsx`', () => {
      expect(rulesFor(withReact, 'component.tsx')).toEqual([
        // `react/no-array-index-key` and
        // `react-dom/no-dangerously-set-innerhtml` in the ESLint config.
        'react/no-array-index-key',
        'react/no-danger',
      ])
    })

    it('warns rather than errors on them', () => {
      expect(
        withReact
          .filter((d) => d.file === 'component.tsx')
          .map((d) => d.severity),
      ).toEqual(['warning', 'warning'])
    })

    it('does not ask for `React` to be in scope', () => {
      expect(withReact.map((d) => d.rule)).not.toContain(
        'react/react-in-jsx-scope',
      )
    })

    it('accepts a TanStack route but not a bare `metadata` export', () => {
      expect(rulesFor(withReact, 'route.tsx')).toEqual([
        'react/only-export-components',
      ])
    })

    it('accepts `metadata` once `next` is on', () => {
      expect(rulesFor(lintCases({ next: true }), 'route.tsx')).toEqual([])
    })
  })

  describe('typeAware', () => {
    it('reports nothing type-aware by default', () => {
      expect(rulesFor(diagnostics, 'type-aware.ts')).toEqual([])
    })

    it('reports the type-aware rules when it is on', () => {
      const rules = rulesFor(lintCases({ typeAware: true }), 'type-aware.ts')

      expect(rules).toContain('typescript/strict-boolean-expressions')
      expect(rules).toContain('typescript/no-unsafe-call')
      expect(rules).toContain('typescript/no-unsafe-return')
    })
  })
})
