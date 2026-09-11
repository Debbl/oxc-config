import { execFileSync } from 'node:child_process'
import {
  cpSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { oxfmt, oxlint } from '~/index.ts'
import { OXFMT_BIN, OXLINT_BIN, writeConfig } from './utils.ts'

import type { OxfmtOptions, OxlintOptions } from '~/index.ts'

const ROOT = join(import.meta.dirname, '..')
const INPUT = join(ROOT, 'fixtures', 'input')
const OUTPUT = join(ROOT, 'fixtures', 'output')
// Outside the repo on purpose: both oxlint and oxfmt skip anything
// `.gitignore` covers, and that cannot be turned off from the CLI.
const WORK = mkdtempSync(join(tmpdir(), 'oxc-config-fixtures-'))

afterAll(() => {
  rmSync(WORK, { recursive: true, force: true })
})

function files(dir: string): string[] {
  return readdirSync(dir, { recursive: true })
    .map(String)
    .filter((entry) => statSync(join(dir, entry)).isFile())
    .toSorted()
}

/**
 * Run `oxlint --fix` then `oxfmt` over `fixtures/input` and snapshot the result
 * into `fixtures/output/<name>`, the way `@debbl/eslint-config` and
 * `@antfu/eslint-config` do it. A file the config leaves untouched gets no
 * snapshot at all.
 */
function runWithConfig(
  name: string,
  lintOptions: OxlintOptions = {},
  formatOptions: OxfmtOptions = {},
) {
  // The title is the variant name, which `valid-title` cannot see is a string.
  // oxlint-disable-next-line vitest/valid-title
  it(name, async () => {
    const target = join(WORK, name)
    cpSync(INPUT, target, { recursive: true })

    const lintConfig = writeConfig(
      target,
      '.oxlintrc.json',
      oxlint(lintOptions),
    )
    const formatConfig = writeConfig(
      target,
      '.oxfmtrc.json',
      oxfmt(formatOptions),
    )
    const run = (bin: string, args: string[]) => {
      try {
        execFileSync(bin, args, {
          cwd: ROOT,
          stdio: ['ignore', 'pipe', 'pipe'],
        })
      } catch {
        // oxlint exits non-zero on anything it could not fix, which is the
        // point of some of these fixtures.
      }
    }

    run(OXLINT_BIN, [
      '-c',
      lintConfig,
      '--disable-nested-config',
      '--fix',
      '--silent',
      target,
    ])
    run(OXFMT_BIN, [
      '-c',
      formatConfig,
      '--disable-nested-config',
      '--write',
      target,
    ])

    for (const file of files(target)) {
      if (file.startsWith('.ox')) continue

      const actual = readFileSync(join(target, file), 'utf8')
      const source = readFileSync(join(INPUT, file), 'utf8')
      const snapshot = join(OUTPUT, name, file)

      if (actual === source) {
        rmSync(snapshot, { force: true })
        continue
      }

      await expect
        .soft(actual, relative(ROOT, snapshot))
        .toMatchFileSnapshot(snapshot)
    }
  })
}

describe('fixtures', () => {
  runWithConfig('default')

  // Proves `overrides` reaches oxfmt, and gives the tab output to diff against.
  runWithConfig('tabs', {}, { overrides: { useTabs: true } })
})
