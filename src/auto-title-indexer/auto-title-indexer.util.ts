// With Flattened Auto Titles Utilities
import { readdir } from 'node:fs/promises';
import type { AutoTitleOptions } from '../auto-title-options/auto-title-options.model';
import {
  applyStripPrefixes,
  defaultFlattenTitle,
  humanizeSegment,
  resolveStripSegmentSuffixes,
} from '../util/util.util';
import type { Indexer, IndexerOptions, IndexInput } from 'storybook/internal/types';

const nestedStoryArtifactCache = new Map<string, Promise<boolean>>();
const STORY_FILE_RE = /^(.*)\.(?:stories|story)\.[^.]+$/iu;
const MDX_FILE_RE = /^(.*)\.mdx$/iu;
const STORY_ARTIFACT_RE = /\.(?:stories|story)\.[^.]+$/iu;

/**
 * Wraps Storybook indexers and replaces generated titles with flatter,
 * human-readable titles derived from the story file path.
 *
 * Example:
 * input: autoTitleIndexer({ stripPrefixes: ['src/'] })
 * output: async function that returns wrapped indexers
 */
export function autoTitleIndexer(
  options: AutoTitleOptions = {},
): (indexers?: Indexer[]) => Promise<Indexer[]> {
  const {
    stripPrefixes = [],
    dedupeAdjacent = true,
    segmentTransform,
    flattenTitle,
    stripSegmentSuffixes = [],
    stripSegmentSuffixesMode = 'add',
  } = options;
  const resolvedStripSegmentSuffixes = resolveStripSegmentSuffixes(
    stripSegmentSuffixes,
    stripSegmentSuffixesMode,
  );

  return async (indexers: Indexer[] | undefined = []) =>
    indexers.map((indexer: Indexer) => ({
      ...indexer,
      createIndex: async (
        fileName: string,
        createIndexOptions: IndexerOptions,
      ): Promise<IndexInput[]> => {
        const entries: IndexInput[] = await indexer.createIndex(fileName, createIndexOptions);
        const hasNestedStoryArtifactsInSubfolders = await hasNestedStoryArtifacts(fileName);

        return entries.map((entry: IndexInput): IndexInput => {
          const sourceTitle = resolveSourceTitle(entry, fileName, createIndexOptions);
          const normalized = applyStripPrefixes(sourceTitle, stripPrefixes);

          const nextTitle =
            flattenTitle?.(normalized) ??
            defaultFlattenTitle(normalized, {
              dedupeAdjacent,
              segmentTransform,
              stripSegmentSuffixes: resolvedStripSegmentSuffixes,
              collapseSuffixedDuplicateSegments: !hasNestedStoryArtifactsInSubfolders,
            });

          const nextName = syncStoryNameWithFileSuffix(
            entry.name,
            fileName,
            resolvedStripSegmentSuffixes,
          );

          return mergeUpdatedEntry(entry, sourceTitle, nextTitle, nextName);
        });
      },
    }));
}

/**
 * Picks the title Storybook would normally use before flattening.
 *
 * Example:
 * input: ({ title: undefined }, "button.stories.ts", { makeTitle })
 * output: result of makeTitle("button.stories.ts")
 */
function resolveSourceTitle(
  entry: IndexInput,
  fileName: string,
  createIndexOptions: IndexerOptions,
): string {
  return (
    entry.title ??
    (createIndexOptions?.makeTitle ? createIndexOptions.makeTitle(fileName) : fileName)
  );
}

/**
 * Applies title/name changes to an index entry and removes stale `__id`
 * whenever the title changes.
 *
 * Example:
 * input: (entry, "a/b", "A/B", "Story")
 * output: updated entry with fresh title and without stale __id
 */
function mergeUpdatedEntry(
  entry: IndexInput,
  sourceTitle: string,
  nextTitle: string,
  nextName: string | undefined,
): IndexInput {
  const titleChanged = Boolean(nextTitle) && nextTitle !== sourceTitle;
  const nameChanged = nextName !== entry.name;

  if (!titleChanged && !nameChanged) {
    return entry;
  }

  const entryWithoutStaleId = { ...entry };
  if (titleChanged) {
    delete entryWithoutStaleId.__id;
  }

  return {
    ...entryWithoutStaleId,
    ...(titleChanged ? { title: nextTitle } : {}),
    ...(nameChanged ? { name: nextName } : {}),
  };
}

/**
 * Synchronizes the rendered story name with the source filename suffix.
 *
 * Example:
 * input: ("Tooltip", "tooltip.directive.stories.ts", [])
 * output: "Tooltip Directive"
 */
function syncStoryNameWithFileSuffix(
  name: string | undefined,
  fileName: string,
  strippedSuffixes: string[],
): string | undefined {
  if (!name) return name;

  const fileBase = getFileBaseName(fileName);
  if (!fileBase) return humanizeRawNameIfNeeded(name, strippedSuffixes);

  if (sameLooseLabel(name, fileBase)) {
    return humanizeSegment(fileBase, undefined, strippedSuffixes);
  }

  const parts = fileBase.split('.').filter(Boolean);
  if (parts.length < 2) return humanizeRawNameIfNeeded(name, strippedSuffixes);

  const suffix = parts[parts.length - 1].toLowerCase();
  const baseWithoutSuffix = parts.slice(0, -1).join('.');
  if (!baseWithoutSuffix) return name;

  const expectedWithoutSuffix = humanizeSegment(baseWithoutSuffix, undefined, []);
  const expectedWithSuffix = `${expectedWithoutSuffix} ${humanizeSegment(suffix, undefined, [])}`;
  const isStripped = strippedSuffixes.some((candidate) => candidate.toLowerCase() === suffix);

  if (isStripped && sameLabel(name, expectedWithSuffix)) {
    return expectedWithoutSuffix;
  }

  if (!isStripped && sameLabel(name, expectedWithoutSuffix)) {
    return expectedWithSuffix;
  }

  return humanizeRawNameIfNeeded(name, strippedSuffixes);
}

/**
 * Extracts the base filename without the terminal extension.
 *
 * Example:
 * input: "button.component.stories.ts"
 * output: "button.component"
 */
function getFileBaseName(fileName: string): string | null {
  const file = fileName.split(/[\\/]/u).pop() ?? '';
  const csfMatch = file.match(STORY_FILE_RE);
  if (csfMatch) return csfMatch[1];

  const mdxMatch = file.match(MDX_FILE_RE);
  return mdxMatch?.[1] ?? null;
}

/**
 * Compares labels after trimming, collapsing whitespace, and lowercasing.
 *
 * Example:
 * input: ("Tooltip Directive", "tooltip   directive")
 * output: true
 */
function sameLabel(left: string, right: string): boolean {
  return normalizeLabel(left) === normalizeLabel(right);
}

/**
 * Compares labels after normalizing separators, casing, and camelCase splits.
 *
 * Example:
 * input: ("NgTemplateTypeExample", "ng-template-type-example")
 * output: true
 */
function sameLooseLabel(left: string, right: string): boolean {
  return normalizeLooseLabel(left) === normalizeLooseLabel(right);
}

/**
 * Produces a case-insensitive canonical label form.
 *
 * Example:
 * input: "  Tooltip   Directive "
 * output: "tooltip directive"
 */
function normalizeLabel(value: string): string {
  return value.trim().replace(/\s+/gu, ' ').toLowerCase();
}

/**
 * Produces a canonical label form that also treats dots, dashes, underscores,
 * and camelCase boundaries as word separators.
 *
 * Example:
 * input: "ngTemplate-type_example"
 * output: "ng template type example"
 */
function normalizeLooseLabel(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/gu, '$1 $2')
    .replace(/[-_.\s]+/gu, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Humanizes raw machine-style names while leaving already readable labels intact.
 *
 * Example:
 * input: ("ng-template-type-example.example", [])
 * output: "Ng Template Type Example Example"
 */
function humanizeRawNameIfNeeded(name: string, strippedSuffixes: string[]): string {
  if (looksRawLabel(name)) {
    return humanizeSegment(name, undefined, strippedSuffixes);
  }
  return name;
}

/**
 * Detects labels that still look like filenames rather than readable titles.
 *
 * Example:
 * input: "tooltip.directive"
 * output: true
 */
function looksRawLabel(name: string): boolean {
  return /[-_.]/u.test(name) && !/\s/u.test(name);
}

/**
 * Checks whether the story's folder contains nested child folders with their own
 * story artifacts, which tells the flattener to preserve one extra hierarchy level.
 *
 * Example:
 * input: "/tmp/main-menu/main-menu.component.stories.ts"
 * output: true | false
 */
async function hasNestedStoryArtifacts(fileName: string): Promise<boolean> {
  const directory = getParentDirectory(fileName);
  if (!directory || directory === '.') return false;

  let cached = nestedStoryArtifactCache.get(directory);
  if (!cached) {
    cached = scanSubdirectoriesForStoryArtifacts(directory);
    nestedStoryArtifactCache.set(directory, cached);
  }
  return cached;
}

/**
 * Scans direct child directories of a story folder for nested stories or MDX docs.
 *
 * Example:
 * input: "/tmp/main-menu"
 * output: true | false
 */
async function scanSubdirectoriesForStoryArtifacts(directory: string): Promise<boolean> {
  try {
    const directChildren = await readdir(directory, { withFileTypes: true });
    const subdirs = directChildren
      .filter((entry) => entry.isDirectory())
      .map((entry) => joinPath(directory, entry.name));

    for (const subdir of subdirs) {
      if (await directoryTreeHasStoryArtifacts(subdir)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Walks a directory tree and returns true on the first nested story artifact found.
 *
 * Example:
 * input: "/tmp/main-menu/content"
 * output: true | false
 */
async function directoryTreeHasStoryArtifacts(rootDir: string): Promise<boolean> {
  const queue: string[] = [rootDir];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    let children;
    try {
      children = await readdir(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of children) {
      if (entry.isDirectory()) {
        queue.push(joinPath(current, entry.name));
        continue;
      }
      if (entry.isFile() && isStoryArtifactFile(entry.name)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Tests whether a filename is a Storybook story file or an MDX docs file.
 *
 * Example:
 * input: "button.stories.ts"
 * output: true
 */
function isStoryArtifactFile(fileName: string): boolean {
  return STORY_ARTIFACT_RE.test(fileName) || MDX_FILE_RE.test(fileName);
}

/**
 * Returns the parent directory for a filesystem path using forward-slash normalization.
 *
 * Example:
 * input: "stories/examples/button/button.stories.ts"
 * output: "stories/examples/button"
 */
function getParentDirectory(fileName: string): string {
  const normalized = fileName.replace(/\\/gu, '/');
  const lastSlash = normalized.lastIndexOf('/');
  return lastSlash <= 0 ? '' : normalized.slice(0, lastSlash);
}

/**
 * Joins two path segments using forward slashes.
 *
 * Example:
 * input: ("stories/examples", "button")
 * output: "stories/examples/button"
 */
function joinPath(base: string, child: string): string {
  return `${base.replace(/\/+$/u, '')}/${child.replace(/^\/+/u, '')}`;
}
