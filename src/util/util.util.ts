// Util Utilities

export function applyStripPrefixes(value: string, prefixes: string[]): string {
  for (const prefix of prefixes) {
    if (value.startsWith(prefix)) return value.slice(prefix.length);
  }
  return value;
}

export function defaultFlattenTitle(
  sourceTitle: string,
  cfg: { dedupeAdjacent: boolean; segmentTransform?: (s: string) => string },
): string {
  // Convert path-like auto titles to readable recursive sidebar groups.
  // Example:
  // components/production-chain-editor/.../catalog-recipe-form/catalog-recipe-form.component
  // -> Components/Production Chain Editor/.../Catalog Recipe Form
  const humanized = sourceTitle
    .split('/')
    .filter(Boolean)
    .map((segment) => humanizeSegment(segment, cfg.segmentTransform))
    .filter(Boolean);

  // Storybook auto-title often repeats the final directory as "*.component".
  // Collapse adjacent duplicates so we keep folder hierarchy without noise.
  const deduped = cfg.dedupeAdjacent
    ? humanized.filter((seg, i, all) => i === 0 || seg.toLowerCase() !== all[i - 1].toLowerCase())
    : humanized;

  return deduped.join('/');
}

/**
 * Normalize a path segment into a human-friendly sidebar label.
 * Removes story/component suffixes and converts kebab/snake/dot case to words.
 */
export function humanizeSegment(value: string, transform?: (segment: string) => string): string {
  // remove angular-ish suffix noise
  const cleaned = value
    .replace(/\.component$/iu, '')
    .replace(/\.stories$/iu, '')
    .replace(/\.story$/iu, '');

  const words = cleaned.split(/[-_.\s]+/u).filter(Boolean);
  const titled = words.map((w) => `${w.charAt(0).toUpperCase()}${w.slice(1)}`).join(' ');
  return transform ? transform(titled) : titled;
}
