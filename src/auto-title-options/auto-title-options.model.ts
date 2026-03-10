export interface AutoTitleOptions {
  /**
   * Remove leading path prefixes before humanizing.
   * Example: ["src/app/", "libs/"].
   */
  stripPrefixes?: string[];

  /**
   * If true, removes repeated adjacent segments (case-insensitive).
   */
  dedupeAdjacent?: boolean;

  /**
   * Transform each segment label.
   * Defaults to Title Case.
   */
  segmentTransform?: (segment: string) => string;

  /**
   * Custom title flattener override.
   */
  flattenTitle?: (sourceTitle: string) => string;

  /**
   * Additional or replacement segment suffixes to remove before humanizing.
   * Example: ["component", "directive", "service"].
   */
  stripSegmentSuffixes?: string[];

  /**
   * Controls how stripSegmentSuffixes is applied.
   * - "add": append custom suffixes to the default Angular + Storybook list.
   * - "replace": use only stripSegmentSuffixes.
   */
  stripSegmentSuffixesMode?: 'add' | 'replace';
}
