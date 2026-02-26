# storybook-auto-titles

🧠 Human-readable, automatically generated Storybook sidebar titles — zero per-story boilerplate.

Automatically transform Storybook’s implicit auto-titles into clean, readable, hierarchical groups based on your file structure.

---

## ✨ Features

- ✅ Storybook 8, 9, and 10 compatible
- ✅ Framework agnostic (Angular, React, Vue, Web Components, etc.)
- ✅ Keeps Storybook’s auto-title logic (uses `makeTitle`)
- ✅ Converts kebab-case / snake_case / dotted names → Title Case
- ✅ Removes noisy suffixes like `.component` and `.stories`
- ✅ Deduplicates repeated path segments
- ✅ Optional prefix stripping (`src/app`, `libs/ui`, etc.)
- ✅ No changes required in your story files
- ✅ ESM + CJS compatible
- ✅ Monorepo and Nx friendly

---

## 📦 Installation

```bash
pnpm add -D storybook-auto-titles
# or
npm i -D storybook-auto-titles
# or
yarn add -D storybook-auto-titles
```

### Local install (no npm registry)

```bash
pnpm run build
pnpm pack --pack-destination .
pnpm add -D ../storybook-auto-title/storybook-auto-titles-<version>.tgz
```

---

## 🚀 Usage

### .storybook/main.ts

```ts
import type { StorybookConfig } from '@storybook/angular';
import { withFlattenedAutoTitles } from 'storybook-auto-titles';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx|js|jsx|mdx)'],
  experimental_indexers: withFlattenedAutoTitles(),
};

export default config;
```

That’s it — no per-story `title` needed.

---

## 🧩 Example

### File

```
libs/ui/src/lib/button/button.component.stories.ts
```

### Default Storybook auto-title

```
Libs/Ui/Src/Lib/Button/Button Component
```

### With storybook-auto-titles

```
UI/Button
```

---

## ⚙️ Configuration

```ts
experimental_indexers: withFlattenedAutoTitles({
  stripPrefixes: ['libs/', 'src/app/'],
  dedupeAdjacent: true,
});
```

## Storybook demo in this repo

This repository includes a sample Storybook setup in [`.storybook/main.ts`](./.storybook/main.ts) and stories in [`stories/`](./stories) that demonstrate automatic title flattening.

### Options

| Option           | Type                  | Default    | Description                                     |
| ---------------- | --------------------- | ---------- | ----------------------------------------------- |
| stripPrefixes    | `string[]`            | `[]`       | Removes leading path segments before processing |
| dedupeAdjacent   | `boolean`             | `true`     | Removes repeated adjacent folder names          |
| segmentTransform | `(segment) => string` | Title Case | Custom label formatter                          |
| flattenTitle     | `(title) => string`   | internal   | Full override for custom pipelines              |

---

## 🧠 Why this exists

In large projects, Storybook auto-titles often look like:

```
components/production-chain-editor/catalog-recipe-form/catalog-recipe-form.component
```

This addon turns that into:

```
Components/Production Chain Editor/Catalog Recipe Form
```

Without:

- manually setting `title` in every story
- enforcing naming conventions
- breaking Storybook indexing

---

## 🏗 How it works

We hook into Storybook’s experimental indexer API and:

1. Ask Storybook for the correct implicit title via `options.makeTitle()`
2. Transform the result into a human-readable hierarchy
3. Remove stale `__id` values so HMR and CSF imports stay stable

This means we extend Storybook — we don’t replace its logic.

---

## 🧱 Compatibility (storybook version with experimental_indexers)

| Storybook | Supported |
| --------- | --------- |
| 7.3+      | ✅        |
| 8.x       | ✅        |
| 9.x       | ✅        |
| 10.x      | ✅        |

---

## 🔌 Framework support

- Angular
- React
- Vue
- Svelte
- Web Components
- Next.js / Nx / Turborepo / Vite / Webpack

---

## 🛠 Monorepo friendly

Especially useful for:

- Nx workspaces
- deep `libs/` structures
- shared design systems
- auto-generated stories

---

## 📄 Before / After

### Before

```
libs/ui/src/lib/forms/input-text/input-text.component
```

### After

```
UI/Forms/Input Text
```

---

## 🗺 Roadmap

- Preset mode (`addons` entry)
- Built-in Nx prefix detection
- Configurable casing strategies
- Story sorting helpers

---

## CI/CD

- CI (`.github/workflows/ci.yml`) runs lint/tests/builds and deploys Storybook to GitHub Pages on `main`.
- Release (`.github/workflows/release.yml`) creates a GitHub Release on `v*.*.*` tags and publishes to npm when `NPM_TOKEN` is configured.

---

## 🤝 Contributing

PRs and ideas welcome!

---
