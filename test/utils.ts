import { execFileSync } from 'node:child_process'
import { cpSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { isAbsolute, join, relative, sep } from 'node:path'
import { oxlint } from '~/index.ts'
import type { OxlintOptions } from '~/index.ts'

const BIN = join(import.meta.dirname, '..', 'node_modules', '.bin')

export const OXLINT_BIN = join(BIN, 'oxlint')
export const OXFMT_BIN = join(BIN, 'oxfmt')

/** Write a config next to the files it applies to, and return its path. */
export function writeConfig(
  dir: string,
  name: string,
  config: unknown,
): string {
  const file = join(dir, name)
  writeFileSync(file, JSON.stringify(config))

  return file
}

export interface ResolvedConfig {
  plugins: string[]
  categories: Record<string, string>
  rules: Record<string, unknown>
  overrides: { files: string[]; rules: Record<string, unknown> }[]
  options?: Record<string, unknown>
}

const cache = new Map<string, ResolvedConfig>()

/**
 * Hand the config to oxlint and read back what it resolved to.
 *
 * This is the point of these tests: oxlint validates rule names *and* their
 * options, and rejects the whole config on the first one it does not
 * recognise. A rule ported from the ESLint config under a name oxlint does not
 * have - or with an option oxlint spells differently, like react-refresh's
 * `extraHOCs` vs oxlint's `customHOCs` - fails here rather than in a repo.
 */
export function resolve(options: OxlintOptions = {}): ResolvedConfig {
  const key = JSON.stringify(options)
  const cached = cache.get(key)
  if (cached) return cached

  const dir = mkdtempSync(join(tmpdir(), 'oxc-config-'))
  const file = writeConfig(dir, 'oxlintrc.json', oxlint(options))

  const stdout = execFileSync(OXLINT_BIN, ['-c', file, '--print-config'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  const config = JSON.parse(stdout) as ResolvedConfig
  cache.set(key, config)

  return config
}

/** Severity oxlint resolved a rule to, or `undefined` if it is not enabled. */
export function severity(
  config: ResolvedConfig,
  rule: string,
): string | undefined {
  const value = config.rules[rule]
  if (value === undefined) return undefined
  return Array.isArray(value) ? (value[0] as string) : (value as string)
}

/**
 * Options oxlint resolved a rule to. `--print-config` prints them as
 * `[severity, [ ...options ]]`, so this unwraps both layers.
 */
export function ruleOptions(config: ResolvedConfig, rule: string): unknown[] {
  const value = config.rules[rule]
  if (!Array.isArray(value)) return []

  return (value[1] as unknown[] | undefined) ?? []
}

/** A single entry from {@link ruleOptions}, the first one by default. */
export function ruleOption(
  config: ResolvedConfig,
  rule: string,
  index = 0,
): unknown {
  return ruleOptions(config, rule)[index]
}

const CASES = join(import.meta.dirname, 'cases')

export interface Diagnostic {
  /** Fixture path, always with `/` separators. */
  file: string
  /** `plugin/rule`, unwrapped from oxlint's `plugin(rule)` code. */
  rule: string
  severity: string
}

/**
 * Lint `test/cases` with the config these options produce.
 *
 * The cases are copied to a temp directory and the config is written beside
 * them, because oxlint anchors an override glob containing a `/` -
 * `scripts/**\/*` - to the directory the config lives in.
 */
export function lintCases(options: OxlintOptions = {}): Diagnostic[] {
  const dir = mkdtempSync(join(tmpdir(), 'oxc-config-cases-'))
  cpSync(CASES, dir, { recursive: true })
  const config = writeConfig(dir, '.oxlintrc.json', oxlint(options))

  let stdout: string
  try {
    // Run from the repo, not from `dir`: oxlint resolves `oxlint-tsgolint`
    // relative to the working directory, but anchors override globs to the
    // directory the config file is in.
    stdout = execFileSync(
      OXLINT_BIN,
      ['-c', config, '--disable-nested-config', '-f', 'json', dir],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
    )
  } catch (error) {
    // oxlint exits non-zero when it reports errors, which is the normal case
    // here. A config it could not parse has no stdout at all.
    const { stdout: output } = error as { stdout?: string }
    if (!output) throw error
    stdout = output
  }

  const { diagnostics } = JSON.parse(stdout) as {
    diagnostics: { code: string; severity: string; filename: string }[]
  }

  return diagnostics.map(({ code, severity: level, filename }) => ({
    // oxlint reports paths as given; `.` as the target makes them relative.
    file: (isAbsolute(filename) ? relative(dir, filename) : filename)
      .split(sep)
      .join('/'),
    rule: code.replace(/^(.+)\((.+)\)$/, '$1/$2'),
    severity: level,
  }))
}

/** Rules reported for one case file, deduplicated and sorted. */
export function rulesFor(diagnostics: Diagnostic[], file: string): string[] {
  return [
    ...new Set(diagnostics.filter((d) => d.file === file).map((d) => d.rule)),
  ].toSorted()
}
