// With Flattened Auto Titles Utilities
import type { AutoTitleOptions } from '../auto-title-options/auto-title-options.model';
import { applyStripPrefixes, defaultFlattenTitle } from '../util/util.util';
import type { Indexer, IndexerOptions, IndexInput } from 'storybook/internal/types';

export function withFlattenedAutoTitles(
  options: AutoTitleOptions = {},
): (indexers?: Indexer[]) => Promise<Indexer[]> {
  const { stripPrefixes = [], dedupeAdjacent = true, segmentTransform, flattenTitle } = options;

  return async (indexers: Indexer[] | undefined = []) =>
    indexers.map((indexer: Indexer) => ({
      ...indexer,
      createIndex: async (
        fileName: string,
        createIndexOptions: IndexerOptions,
      ): Promise<IndexInput[]> => {
        const entries: IndexInput[] = await indexer.createIndex(fileName, createIndexOptions);
        return entries.map((entry: IndexInput): IndexInput => {
          // Keep default indexing, then replace only the sidebar title.

          const sourceTitle: string =
            entry.title ??
            // fileName;
            (createIndexOptions?.makeTitle ? createIndexOptions.makeTitle(fileName) : fileName);

          const normalized: string = applyStripPrefixes(sourceTitle, stripPrefixes);

          const nextTitle: string =
            flattenTitle?.(normalized) ??
            defaultFlattenTitle(normalized, {
              dedupeAdjacent,
              segmentTransform,
            });

          if (!nextTitle || nextTitle === sourceTitle) {
            return entry;
          }

          // Avoid stale ID mismatch if Storybook precomputed one.
          const entryWithoutStaleId = { ...entry };
          delete entryWithoutStaleId.__id;

          return { ...entryWithoutStaleId, title: nextTitle };
        });
      },
    }));
}
