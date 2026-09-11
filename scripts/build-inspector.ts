import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import type { OxlintOptions } from '../src/index.ts'

/**
 * Build one `oxlint-config-inspector` site per preset, plus an index linking
 * them, into `.inspector/`.
 *
 * The presets are the ones `test/snapshot.test.ts` records, so the deployed
 * site and the checked-in snapshots always describe the same configs.
 *
 * `INSPECTOR_BASE` is the path the site is served from - `/oxc-config/` on
 * GitHub Pages, `/` locally.
 */
const PRESETS: { name: string; label: string; options: OxlintOptions }[] = [
  { name: 'default', label: 'Default', options: {} },
  { name: 'react', label: 'React', options: { react: true } },
  {
    name: 'next-a11y',
    label: 'Next.js + a11y',
    options: { next: true, a11y: true },
  },
  {
    name: 'type-aware',
    label: 'Everything, type-aware',
    options: { next: true, a11y: true, typeAware: true },
  },
]

const ROOT = join(import.meta.dirname, '..')
const OUT = join(ROOT, '.inspector')
const BASE = process.env.INSPECTOR_BASE || '/'
const BIN = join(ROOT, 'node_modules', '.bin', 'oxlint-config-inspector')

interface Stats {
  enabledRules: number
  configuredRules: number
  totalRules: number
}

/**
 * The inspector records the absolute path of the config it loaded, which here
 * is a scratch file under someone's home directory or a CI runner's workspace.
 * Rewrite it to the name a consumer would actually have, and refuse to ship a
 * build if any absolute path survives - a future inspector version could start
 * recording more of them.
 */
function sanitize(dir: string): Stats {
  const file = join(dir, 'data.json')
  const data = JSON.parse(readFileSync(file, 'utf8')) as {
    configFiles: string[]
    configFilepath: string
    stats: Stats
  }

  data.configFiles = ['oxlint.config.ts']
  data.configFilepath = 'oxlint.config.ts'

  const json = JSON.stringify(data, null, 2)
  for (const leak of [ROOT, homedir()]) {
    if (json.includes(leak)) {
      throw new Error(`${file} still contains ${leak}`)
    }
  }

  writeFileSync(file, json)

  return data.stats
}

function configFor(options: OxlintOptions): string {
  const args = Object.keys(options).length > 0 ? JSON.stringify(options) : ''

  return `import { defineConfig } from 'oxlint'
import { oxlint } from './src/index.ts'

export default defineConfig({ extends: [oxlint(${args})] })
`
}

function renderIndex(entries: { label: string; name: string; stats: Stats }[]) {
  const cards = entries
    .map(
      ({ label, name, stats }) => `    <a href="${BASE}${name}/">
      <h2>${label}</h2>
      <p><b>${stats.enabledRules}</b> of ${stats.totalRules} rules enabled, <b>${stats.configuredRules}</b> written out explicitly</p>
      <code>oxlint(${JSON.stringify(PRESETS.find((p) => p.name === name)!.options)})</code>
    </a>`,
    )
    .join('\n')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>@debbl/oxc-config</title>
    <link rel="icon" href="${BASE}default/favicon.svg" />
    <style>
      :root { color-scheme: light dark; --fg: #1a1a1a; --bg: #fff; --muted: #666; --line: #e5e5e5; --card: #fafafa; }
      @media (prefers-color-scheme: dark) {
        :root { --fg: #e8e8e8; --bg: #111; --muted: #999; --line: #2a2a2a; --card: #181818; }
      }
      * { box-sizing: border-box; }
      body { margin: 0; padding: 3rem 1.5rem; background: var(--bg); color: var(--fg);
        font: 16px/1.6 ui-sans-serif, system-ui, sans-serif; }
      main { max-width: 46rem; margin: 0 auto; }
      h1 { font-size: 1.5rem; margin: 0 0 .25rem; }
      .lede { color: var(--muted); margin: 0 0 2.5rem; }
      .lede a { color: inherit; }
      a { color: inherit; }
      main > a { display: block; text-decoration: none; border: 1px solid var(--line);
        border-radius: .6rem; padding: 1.1rem 1.25rem; margin-bottom: .75rem; background: var(--card); }
      main > a:hover { border-color: var(--muted); }
      h2 { font-size: 1.05rem; margin: 0 0 .35rem; }
      p { margin: 0 0 .6rem; color: var(--muted); font-size: .9rem; }
      b { color: var(--fg); }
      code { font: .8rem ui-monospace, SFMono-Regular, monospace; color: var(--muted); }
    </style>
  </head>
  <body>
    <main>
      <h1>@debbl/oxc-config</h1>
      <p class="lede">
        What each preset turns on, through
        <a href="https://github.com/nelsonlaidev/oxlint-config-inspector">oxlint-config-inspector</a>.
        Source on <a href="https://github.com/Debbl/oxc-config">GitHub</a>.
      </p>
${cards}
    </main>
  </body>
</html>
`
}

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const entries: { label: string; name: string; stats: Stats }[] = []

for (const { name, label, options } of PRESETS) {
  const config = join(ROOT, `oxlint.inspector-${name}.config.ts`)
  writeFileSync(config, configFor(options))

  try {
    execFileSync(
      BIN,
      [
        'build',
        '-c',
        config,
        '--base',
        `${BASE}${name}/`,
        '--out-dir',
        join(OUT, name),
      ],
      { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] },
    )
  } finally {
    rmSync(config, { force: true })
  }

  const stats = sanitize(join(OUT, name))

  entries.push({ label, name, stats })
  console.log(`${name}: ${stats.enabledRules} rules enabled`)
}

writeFileSync(join(OUT, 'index.html'), renderIndex(entries))
console.log(`\nBuilt to .inspector, served from ${BASE}`)
