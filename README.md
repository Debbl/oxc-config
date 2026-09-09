# @debbl/oxc-config

Shared [oxlint](https://oxc.rs) and [oxfmt](https://oxc.rs) config.

```bash
pnpm add -D @debbl/oxc-config oxlint oxfmt
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

| option    | default |                                                                     |
| --------- | ------- | ------------------------------------------------------------------- |
| `react`   | `false` | React rules, including the React Compiler ones oxlint runs natively |
| `next`    | `false` | Next.js rules; implies `react`                                      |
| `a11y`    | `false` | `jsx-a11y` rules; implies `react`                                   |
| `node`    | `true`  | Node-only rules                                                     |
| `jsdoc`   | `true`  | JSDoc rules                                                         |
| `plugins` | `[]`    | Extra plugins on top of the above                                   |

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

## File names matter

Both tools auto-discover `oxlint.config.ts` and `oxfmt.config.ts` **only** -
`.oxlintrc.ts` is not on the list, and a TS config under any other name needs
an explicit `-c`. With the canonical names, no `-c` anywhere: scripts,
lint-staged and the VS Code extension all find them.

## License

MIT
