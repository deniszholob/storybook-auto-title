# Storybook Auto Titles

Human-readable, automatically generated Storybook sidebar titles — zero per-story boilerplate.

Automatically transform Storybook’s implicit auto-titles into clean, readable, hierarchical groups based on your file structure.

# Support Me

If you find the this useful, consider:

- Donating Ko-fi: https://ko-fi.com/deniszholob
- Supporting on Patreon: https://www.patreon.com/deniszholob

# 🧩 Example

See https://deniszholob.github.io/storybook-auto-title/ for example storybook deployment

## With @deniszholob/storybook-auto-titles

```
Components/Generic/Badge
```

[![Component Storybook Auto Title](screenshots/component-sb-auto-title.png)](screenshots/component-sb-auto-title.png)

## Default Storybook titles

```
Components/generic/badge/badge.component/Badge
```

[![Component Storybook Default Title](screenshots/component-sb-default-title.png)](screenshots/component-sb-default-title.png)

## File tree

```
src/app/components/generic/badge/badge.component.stories.ts
```

[![Component Location](screenshots/component-location.png)](screenshots/component-location.png)

# 📦 Installation

## From npm

```bash
pnpm add -D @deniszholob/storybook-auto-titles
# or
npm i -D @deniszholob/storybook-auto-titles
# or
yarn add -D @deniszholob/storybook-auto-titles
```

## Local install (no npm registry)

Download release asset https://github.com/deniszholob/storybook-auto-title/releases

```bash
pnpm add -D storybook-auto-titles-<version>.tgz
```

# 🚀 Usage

## .storybook/main.ts

```ts
import { autoTitleIndexer, AutoTitleOptions } from '@deniszholob/storybook-auto-titles';
import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx|js|jsx|mdx)'],
  experimental_indexers: autoTitleIndexer({
    // Config Options
  } satisfies AutoTitleOptions),
};

export default config;
```

For MDX docs, prefer attached docs with `Meta of={...}` so the docs page inherits the same auto-title path as its story file.

# ⚙️ Configuration

```ts
experimental_indexers: autoTitleIndexer({
  stripPrefixes: ['libs/', 'src/app/'],
  dedupeAdjacent: true,
  stripSegmentSuffixes: ['widget'],
  stripSegmentSuffixesMode: 'add',
});
```

## Config Options

| Option                   | Type                  | Default    | Description                                                  |
| ------------------------ | --------------------- | ---------- | ------------------------------------------------------------ |
| stripPrefixes            | `string[]`            | `[]`       | Removes leading path segments before processing              |
| dedupeAdjacent           | `boolean`             | `true`     | Removes repeated adjacent folder names                       |
| segmentTransform         | `(segment) => string` | Title Case | Custom label formatter                                       |
| flattenTitle             | `(title) => string`   | internal   | Full override for custom pipelines                           |
| stripSegmentSuffixes     | `string[]`            | `[]`       | Extra or replacement suffixes to strip (without leading `.`) |
| stripSegmentSuffixesMode | `'add' \| 'replace'`  | `'add'`    | `add` merges with defaults; `replace` uses only your list    |

Default stripped suffixes include Angular + Storybook values:
`component`, `directive`, `service`, `pipe`, `module`, `guard`, `resolver`, `interceptor`, `stories`, `story`.

Story names are also synced with the story file suffix:

- if suffix is stripped, `Tooltip Directive` becomes `Tooltip`
- if suffix is not stripped (for example replace with `[]`), `Tooltip` becomes `Tooltip Directive`
- if a raw name still looks like a filename, it is humanized automatically

# ✨ Features

- ✅ Storybook 8, 9, and 10+ compatible (storybook versions with experimental_indexers)
- ✅ Framework agnostic (Angular, React, Vue, Web Components, etc.)
- ✅ Keeps Storybook’s auto-title logic (uses `makeTitle`)
- ✅ Converts kebab-case / snake_case / dotted names → Title Case
- ✅ Removes noisy suffixes like `.component`, `.directive`, `.service`, `.stories`, etc...
- ✅ Keeps story names in sync with suffix stripping rules
- ✅ Preserves nested component folders when child folders also contain stories/docs
- ✅ Deduplicates repeated path segments
- ✅ Optional prefix stripping (`src/app`, `libs/ui`, etc.)
- ✅ No changes required in your story files
- ✅ ESM + CJS compatible
- ✅ Monorepo and Nx friendly

# 🧠 Why this exists

Without this, you would either:

- manually setting `title` in every story to achieve pretty title (hard to manage)
- use the defaults (not as friendly, and requires more clicks)

# 🏗 How it works

We hook into Storybook’s experimental indexer API and:

1. Ask Storybook for the correct implicit title via `options.makeTitle()`
2. Transform the result into a human-readable hierarchy
3. Sync raw story names with the file suffix when needed
4. Remove stale `__id` values so HMR and CSF imports stay stable
