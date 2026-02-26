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
}
