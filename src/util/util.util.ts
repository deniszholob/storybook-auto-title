export const DEFAULT_STRIP_SEGMENT_SUFFIXES: string[] = [
  'component',
  'directive',
  'service',
  'pipe',
  'module',
  'guard',
  'resolver',
  'interceptor',
  'stories',
  'story',
];

type FlattenTitleConfig = {
  dedupeAdjacent: boolean;
  segmentTransform?: (segment: string) => string;
  stripSegmentSuffixes?: string[];
  collapseSuffixedDuplicateSegments?: boolean;
};

/**
 * Removes the first matching leading prefix from a generated title.
 *
 * Example:
 * input: ("src/app/button/button.component", ["src/app/"])
 * output: "button/button.component"
 */
export function applyStripPrefixes(value: string, prefixes: string[]): string {
  for (const prefix of prefixes) {
    if (value.startsWith(prefix)) return value.slice(prefix.length);
  }
  return value;
}

/**
 * Converts a Storybook auto-title into a readable slash-separated hierarchy.
 *
 * Example:
 * input: ("components/button/button.component", { dedupeAdjacent: true })
 * output: "Components/Button"
 */
export function defaultFlattenTitle(sourceTitle: string, cfg: FlattenTitleConfig): string {
  const rawSegments = sourceTitle.split('/').filter(Boolean);
  const humanized = rawSegments
    .map((segment) => humanizeSegment(segment, cfg.segmentTransform, cfg.stripSegmentSuffixes))
    .filter(Boolean);

  // Storybook auto-title often repeats the final directory as "*.component".
  // Collapse adjacent duplicates so we keep folder hierarchy without noise.
  const deduped = cfg.dedupeAdjacent
    ? dedupeAdjacentSegments(humanized, rawSegments, cfg.collapseSuffixedDuplicateSegments ?? true)
    : humanized;

  return deduped.join('/');
}

/**
 * Normalizes a single path segment into a human-readable label.
 *
 * Example:
 * input: "catalog-recipe-form.component"
 * output: "Catalog Recipe Form"
 */
export function humanizeSegment(
  value: string,
  transform?: (segment: string) => string,
  stripSegmentSuffixes: string[] = DEFAULT_STRIP_SEGMENT_SUFFIXES,
): string {
  return humanizeSegmentWithSuffixes(value, stripSegmentSuffixes, transform);
}

/**
 * Resolves the effective suffix list used when humanizing filenames.
 *
 * Example:
 * input: (["widget"], "add")
 * output: ["component", ..., "story", "widget"]
 */
export function resolveStripSegmentSuffixes(
  custom: string[] = [],
  mode: 'add' | 'replace' = 'add',
): string[] {
  const cleanedCustom = custom.map((s) => s.trim().replace(/^\./u, '')).filter(Boolean);

  if (mode === 'replace') {
    return [...new Set(cleanedCustom)];
  }

  return [...new Set([...DEFAULT_STRIP_SEGMENT_SUFFIXES, ...cleanedCustom])];
}

/**
 * Humanizes a segment after removing a known dotted suffix.
 *
 * Example:
 * input: ("hero.widget", ["widget"])
 * output: "Hero"
 */
function humanizeSegmentWithSuffixes(
  value: string,
  suffixes: string[],
  transform?: (segment: string) => string,
): string {
  const cleaned = removeDotSuffix(value, suffixes);

  const words = cleaned.split(/[-_.\s]+/u).filter(Boolean);
  const titled = words.map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`).join(' ');
  return transform ? transform(titled) : titled;
}

/**
 * Removes one trailing dotted suffix if it matches the configured list.
 *
 * Example:
 * input: ("button.component", ["component"])
 * output: "button"
 */
function removeDotSuffix(value: string, suffixes: string[]): string {
  const dotSuffix = suffixes.find((suffix) =>
    value.toLowerCase().endsWith(`.${suffix.toLowerCase()}`),
  );
  return dotSuffix ? value.slice(0, -`.${dotSuffix}`.length) : value;
}

/**
 * Removes repeated adjacent segments and optionally collapses
 * "folder/file-with-same-base.suffix" into a single label.
 *
 * Example:
 * input: (["Button", "Button Component"], ["button", "button.component"], true)
 * output: ["Button Component"]
 */
function dedupeAdjacentSegments(
  humanized: string[],
  rawSegments: string[],
  collapseSuffixedDuplicateSegments: boolean,
): string[] {
  const dedupedHumanized: string[] = [];
  const dedupedRaw: string[] = [];

  humanized.forEach((segment, i) => {
    const raw = rawSegments[i];
    const prevIndex = dedupedHumanized.length - 1;
    const prevSegment = dedupedHumanized[prevIndex];
    const prevRaw = dedupedRaw[prevIndex];

    if (!prevSegment) {
      dedupedHumanized.push(segment);
      dedupedRaw.push(raw);
      return;
    }

    if (segment.toLowerCase() === prevSegment.toLowerCase()) {
      return;
    }

    if (collapseSuffixedDuplicateSegments && shouldReplacePreviousBaseSegment(prevRaw, raw)) {
      dedupedHumanized[prevIndex] = segment;
      dedupedRaw[prevIndex] = raw;
      return;
    }

    dedupedHumanized.push(segment);
    dedupedRaw.push(raw);
  });

  return dedupedHumanized;
}

/**
 * Detects whether the current segment is the same base name as the previous one,
 * but with a dotted suffix such as ".component".
 *
 * Example:
 * input: ("button", "button.component")
 * output: true
 */
function shouldReplacePreviousBaseSegment(previousRaw: string, currentRaw: string): boolean {
  const dotIndex = currentRaw.lastIndexOf('.');
  if (dotIndex <= 0) return false;

  const currentBase = currentRaw.slice(0, dotIndex).toLowerCase();
  return currentBase === previousRaw.toLowerCase();
}
