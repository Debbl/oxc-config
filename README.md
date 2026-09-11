# @debbl/oxc-config

Shared [oxlint](https://oxc.rs) and [oxfmt](https://oxc.rs) config.

```bash
pnpm add -D @debbl/oxc-config oxlint oxfmt
```

```json
{
  "scripts": {
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "format": "oxfmt",
    "format:check": "oxfmt --check"
  }
}
```

## oxlint

oxlint's `extends` takes config objects in a TS config and merges them first to
last, so a repo writes only what differs.

```ts
// oxlint.config.ts
import { defineConfig } from 'oxlint'
import { oxlint } from '@debbl/oxc-config'

export default defineConfig({
  extends: [oxlint({ react: true, next: true, a11y: true })],
  ignorePatterns: ['content/**/*.md'],
})
```

| option      | default |                                                                     |
| ----------- | ------- | ------------------------------------------------------------------- |
| `react`     | `false` | React rules, including the React Compiler ones oxlint runs natively |
| `next`      | `false` | Next.js rules; implies `react`                                      |
| `a11y`      | `false` | `jsx-a11y` rules; implies `react`                                   |
| `node`      | `true`  | Node-only rules                                                     |
| `jsdoc`     | `true`  | JSDoc rules                                                         |
| `test`      | `true`  | Vitest rules, scoped to test files                                  |
| `typeAware` | `false` | Rules that need type information; needs `oxlint-tsgolint`           |
| `plugins`   | `[]`    | Extra plugins on top of the above                                   |

`plugins` replaces oxlint's default plugin set rather than adding to it, which
is why `eslint`, `typescript`, `unicorn`, `oxc` and `import` are listed
explicitly.

## oxfmt

oxfmt has no `extends`, so this returns the whole config and takes the
per-repo bits as options.

```ts
// oxfmt.config.ts
import { oxfmt } from '@debbl/oxc-config'

export default oxfmt({
  tailwind: './src/styles/tailwindcss/index.css',
  ignorePatterns: ['content/**/*.md'],
})
```

| option           | default |                                                                                                              |
| ---------------- | ------- | ------------------------------------------------------------------------------------------------------------ |
| `tailwind`       | `false` | Sort Tailwind classes. A string is the v4 entry stylesheet; `true` uses the installed Tailwind's `theme.css` |
| `ignorePatterns` | `[]`    | Added to the generated files this config already ignores                                                     |
| `overrides`      | `{}`    | Merged last, for anything not spelled out here                                                               |

## Parity with `@debbl/eslint-config`

Every rule `@debbl/eslint-config` turns on that oxlint implements is enabled
here, with the same options - names, severities and all. `categories` alone
does not get you there: 79 of them sit in oxlint's `style`, `restriction` and
`pedantic` categories (`eqeqeq`, `prefer-const`, `no-var`, `no-console`,
`prefer-template`, `import/first`, `unicorn/prefer-node-protocol`,
`typescript/consistent-type-imports`, ...), so they are listed out in `rules`.

That covers 142 of the 168 rules the ESLint config's base set turns on, and 189
of 257 with `react`/`next`/`a11y`, before counting `test` and `typeAware`. What is left over oxlint does not implement:

- `perfectionist/*` and `prettier/prettier` - handled by oxfmt instead
- `eslint-comments/*`, `@tanstack/{query,router,start}/*`
- most of `eslint-react`'s class-component and `Children` rules,
  `react-web-api/no-leaked-*`, `react-hooks-extra/*`
- `dot-notation`, `no-restricted-syntax`, `no-invalid-this`, `no-undef-init`,
  `no-octal`, `no-octal-escape`
- 7 `jsdoc/*` rules, `n/no-deprecated-api`, `n/prefer-global/*`,
  `n/process-exit-as-throw`

`typeAware: true` covers the half of the ESLint config's TypeScript rules that
only ran when it was handed a `tsconfigPath` - `strict-boolean-expressions`,
`no-misused-promises`, `no-unsafe-*`, `switch-exhaustiveness-check` and friends.
It sets oxlint's `options.typeAware`, so no `--type-aware` flag anywhere, but it
does need `oxlint-tsgolint` - oxlint's own optional peer - installed:

```bash
pnpm add -D oxlint-tsgolint
```

Without it, `typescript/no-floating-promises`, `await-thenable` and
`unbound-method` are still in the config - oxlint files them under
`correctness` - they just never fire, since nothing hands them types.

`test: true` scopes the Vitest rules to `**/__tests__/**` and
`*.{spec,test,bench,benchmark}.*`, matching the ESLint config's `GLOB_TESTS`.
`no-only-tests` came from `eslint-plugin-no-only-tests` there; oxlint's
equivalent is `vitest/no-focused-tests`.

Two places oxlint spells things differently, worth knowing if you diff the two:
`react-refresh`'s `extraHOCs` is `customHOCs`, and eslint-react's rules land
under `eslint-plugin-react` names (`react-hooks/rules-of-hooks` is
`react/rules-of-hooks`, `react/no-missing-key` is `react/jsx-key`).

## What this actually buys you

Three defaults that differ from the tools' own, each of which otherwise
rewrites a whole codebase on the first run:

- **`printWidth: 80`.** oxfmt defaults to 100; Prettier defaulted to 80. On one
  repo the difference was 62 files and a net −441 lines.
- **`sortImports.newlinesBetween: false`** and the perfectionist group order
  (type imports last). oxfmt otherwise inserts blank lines between groups and
  moves type imports up. Note oxfmt spells modifiers with underscores
  (`side_effect`, not perfectionist's `side-effect`) and has no
  `ts-equals-import` group.
- **`react/react-in-jsx-scope: off`.** Left on, it fires once per JSX element -
  294 times on the repo this was written for.

Plus `jsx-a11y/prefer-tag-over-role` off: it is wrong for inline
`<svg role='img'>` (the recommended pattern) and for satori trees, which are
not the DOM.

## IDE support (auto fix on save)

Install [`oxc.oxc-vscode`](https://marketplace.visualstudio.com/items?itemName=oxc.oxc-vscode)
and put this in `.vscode/settings.json`:

```jsonc
{
  // Let oxc own both jobs.
  "prettier.enable": false,
  "eslint.enable": false,

  "editor.defaultFormatter": "oxc.oxc-vscode",
  // Both run as code actions, so the order is explicit: format first, then
  // apply lint fixes to the formatted text.
  "editor.formatOnSave": false,
  "editor.codeActionsOnSave": {
    "source.format.oxc": "always",
    "source.fixAll.oxc": "always",
  },
}
```

The extension finds `oxlint.config.ts` and `oxfmt.config.ts` on its own - no
`oxc.configPath` or `oxc.fmt.configPath` needed, as long as they are named that.
`typeAware: true` in the config is not enough for the editor, though: the
extension gates type-aware linting behind its own `"oxc.typeAware": true`.

## Lint staged

```json
{
  "simple-git-hooks": {
    "pre-commit": "pnpm lint-staged"
  },
  "lint-staged": {
    "*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}": ["oxlint --fix", "oxfmt"],
    "*.{json,jsonc,css,scss,html,md,mdx}": ["oxfmt"]
  }
}
```

oxlint runs first so oxfmt gets the last word on layout.

## View what rules are enabled

```bash
npx oxlint --print-config
```

The whole merged rule set - `extends`, `categories` and `rules` flattened into
one object - which is also what `test/__snapshots__` records.

The presets of this config are deployed as browsable inspector sites:
**[oxc-config-inspector.debbl.workers.dev](https://oxc-config-inspector.debbl.workers.dev)**.

```bash
pnpm inspect:build     # one site per preset, plus an index, into .inspector/
pnpm inspect:preview   # serve that through the Workers runtime
pnpm inspect:deploy    # build and wrangler deploy
```

`wrangler.jsonc` is an assets-only Worker - no script, just
`assets.directory`. The inspector navigates with query params and the hash
rather than deep paths, so `html_handling: "auto-trailing-slash"` is all the
routing it needs; no single-page-application fallback.
`.github/workflows/inspector.yml` deploys on every push to `main`, and wants
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as repository secrets.

For your own config, there are two web UIs that read `oxlint.config.ts`
directly:

```bash
# Vite DevTools' oxc integration - covers oxfmt too, and ships an MCP server
npx @vitejs/devtools-oxc

# Standalone, and the closer port of the ESLint inspector's CLI
npx oxlint-config-inspector
```

`oxlint-config-inspector` also has an `inspect` subcommand that dumps the same
data as JSON, which is worth knowing about: every one of oxlint's 870 rules with
its category, docs URL, fixability, whether it needs `--type-aware`, its default
severity and options against the configured ones, and - the part
`--print-config` cannot tell you - whether each rule arrived via `categories`,
an explicit `rules` entry, or an override.

```bash
npx oxlint-config-inspector inspect -o inspect.json
```

One thing to know before deploying a build: the inspector records the absolute
path of the config it loaded in `data.json`, which is somebody's home directory
or a CI workspace. `scripts/build-inspector.ts` rewrites it and then refuses to
finish if any absolute path survives.

## Versioning policy

[Semantic Versioning](https://semver.org), with the usual config-package
caveat: rule changes are not breaking changes.

**Breaking:** Node or oxlint/oxfmt version requirements, an option removed or
renamed, a change that would need edits in most consuming repos.

**Not breaking:** rules enabled or disabled, rule options changed, dependency
bumps - any of which can make a repo newly fail its lint.

## Tests

`pnpm test` runs five suites, none of which mock anything - every one hands a
generated config to the real binaries.

- **`test/oxlint.test.ts`** - `oxlint(...)` through `oxlint --print-config`, for
  every combination of the options. The call _is_ the assertion: oxlint
  validates rule names _and_ their options and rejects the whole config on the
  first one it does not recognise, so a rule ported under a name oxlint does not
  have - or with an option it spells differently, like react-refresh's
  `extraHOCs` vs oxlint's `customHOCs` - fails here rather than in a repo.
- **`test/parity.test.ts`** - the 141 base and 45 React rules
  `@debbl/eslint-config` turns on that oxlint implements, checked in as
  `test/parity.json` under their oxlint names. This is the list worth keeping:
  it describes the _other_ config, so unlike an assertion on the rules object it
  can fail for a reason worth knowing - a rule dropped in a refactor, or renamed
  by an oxlint upgrade.
- **`test/diagnostics.test.ts`** - lints `test/cases/`, small files that each
  trip a specific rule, and asserts what gets reported. This is what covers the
  parts a resolved config cannot show: that `scripts/` and `cli.*` may call
  `console`, that `*.d.ts` may re-import, that the vitest rules only fire in
  test files, and that `typeAware` actually reaches `oxlint-tsgolint`.
- **`test/snapshot.test.ts`** - the whole resolved rule set per preset, in
  `test/__snapshots__`, after `@antfu/eslint-config`'s factory snapshots.
  Asserts nothing about what is correct; it is there so an oxlint bump shows up
  in a pull request diff instead of silently changing what every repo lints
  with. Review the diff, then `vitest -u`.
- **`test/fixtures.test.ts`** - the `fixtures/input` → `fixtures/output/<name>`
  snapshot setup from `@debbl/eslint-config` and `@antfu/eslint-config`, with
  the input files borrowed from the former so the two are diffable. Runs
  `oxlint --fix` then `oxfmt --write` over a copy and snapshots the result; a
  file the config leaves untouched gets no snapshot at all.

The work directory sits in the system temp dir rather than `_fixtures/`,
because both oxlint and oxfmt skip anything `.gitignore` covers and there is no
CLI flag that turns that off.

## File names matter

Both tools auto-discover `oxlint.config.ts` and `oxfmt.config.ts` **only** -
`.oxlintrc.ts` is not on the list, and a TS config under any other name needs
an explicit `-c`. With the canonical names, no `-c` anywhere: scripts,
lint-staged and the VS Code extension all find them.

## License

MIT
