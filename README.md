# @deniszholob/storybook-auto-titles

Human-readable, automatically generated Storybook sidebar titles — zero per-story boilerplate.

Automatically transform Storybook’s implicit auto-titles into clean, readable, hierarchical groups based on your file structure.

## 🧩 Example

See https://deniszholob.github.io/storybook-auto-title/ for example storybook deployment

### File

```
src/app/components/generic/badge/badge.component.stories.ts
```

[![Component Location](screenshots/component-location.png)](screenshots/component-location.png)

### Default Storybook auto-title

```
Components/generic/badge/badge.component/Badge
```

[![Component Storybook Default Title](screenshots/component-sb-default-title.png)](screenshots/component-sb-default-title.png)

### With @deniszholob/storybook-auto-titles

```
Components/Generic/Badge
```

[![Component Storybook Auto Title](screenshots/component-sb-auto-title.png)](screenshots/component-sb-auto-title.png)

## ✨ Features

- ✅ Storybook 8, 9, and 10+ compatible (storybook versions with experimental_indexers)
- ✅ Framework agnostic (Angular, React, Vue, Web Components, etc.)
- ✅ Keeps Storybook’s auto-title logic (uses `makeTitle`)
- ✅ Converts kebab-case / snake_case / dotted names → Title Case
- ✅ Removes noisy suffixes like `.component` and `.stories`
- ✅ Deduplicates repeated path segments
- ✅ Optional prefix stripping (`src/app`, `libs/ui`, etc.)
- ✅ No changes required in your story files
- ✅ ESM + CJS compatible
- ✅ Monorepo and Nx friendly

## 📦 Installation

### From npm

```bash
pnpm add -D @deniszholob/storybook-auto-titles
# or
npm i -D @deniszholob/storybook-auto-titles
# or
yarn add -D @deniszholob/storybook-auto-titles
```

### Local install (no npm registry)

Download release asset https://github.com/deniszholob/storybook-auto-title/releases

```bash
pnpm add -D storybook-auto-titles-<version>.tgz
```

## 🚀 Usage

### .storybook/main.ts

```ts
import type { StorybookConfig } from '@storybook/angular';
import { withFlattenedAutoTitles } from '@deniszholob/storybook-auto-titles';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx|js|jsx|mdx)'],
  experimental_indexers: withFlattenedAutoTitles(),
};

export default config;
```

## ⚙️ Configuration

```ts
experimental_indexers: withFlattenedAutoTitles({
  stripPrefixes: ['libs/', 'src/app/'],
  dedupeAdjacent: true,
});
```

### Options

| Option           | Type                  | Default    | Description                                     |
| ---------------- | --------------------- | ---------- | ----------------------------------------------- |
| stripPrefixes    | `string[]`            | `[]`       | Removes leading path segments before processing |
| dedupeAdjacent   | `boolean`             | `true`     | Removes repeated adjacent folder names          |
| segmentTransform | `(segment) => string` | Title Case | Custom label formatter                          |
| flattenTitle     | `(title) => string`   | internal   | Full override for custom pipelines              |

## 🧠 Why this exists

Without this, you would either:

- manually setting `title` in every story to achieve pretty title (hard to manage)
- use the defaults (not as friendly, and requires more clicks)

## 🏗 How it works

We hook into Storybook’s experimental indexer API and:

1. Ask Storybook for the correct implicit title via `options.makeTitle()`
2. Transform the result into a human-readable hierarchy
3. Remove stale `__id` values so HMR and CSF imports stay stable
