import { withFlattenedAutoTitles } from './with-flattened-auto-titles.util';
import type { IndexInput, Indexer } from 'storybook/internal/types';

function createMockIndexer(entries: IndexInput[]): Indexer {
  return {
    createIndex: async () => entries,
  } as unknown as Indexer;
}

describe('withFlattenedAutoTitles', () => {
  test('uses options.makeTitle when entry.title is missing', async () => {
    const indexer = createMockIndexer([{ name: 'A story' } as IndexInput]);

    const wrapped = await withFlattenedAutoTitles()([indexer]);
    const makeTitle = vi.fn((_fileName: string) => 'components/foo-bar/foo-bar.component');
    const options = { makeTitle };

    const entries = await wrapped[0].createIndex(
      'components/foo-bar/foo-bar.component.stories.ts',
      options,
    );

    expect(makeTitle).toHaveBeenCalledWith('components/foo-bar/foo-bar.component.stories.ts');
    expect(entries[0].title).toBe('Components/Foo Bar');
  });

  test('drops __id when title changes', async () => {
    const indexer = createMockIndexer([{ title: 'a/b', __id: 'stale', name: 'x' } as IndexInput]);

    const wrapped = await withFlattenedAutoTitles()([indexer]);
    const entries = await wrapped[0].createIndex('anything', {});

    expect(entries[0].title).toBe('A/B');
    expect((entries[0] as IndexInput & { __id?: string }).__id).toBeUndefined();
  });

  test('supports stripPrefixes', async () => {
    const indexer = createMockIndexer([
      { title: 'libs/ui/src/lib/button/button.component' } as IndexInput,
    ]);

    const wrapped = await withFlattenedAutoTitles({
      stripPrefixes: ['libs/ui/src/lib/'],
    })([indexer]);

    const entries = await wrapped[0].createIndex('anything', {});
    expect(entries[0].title).toBe('Button');
  });
});
