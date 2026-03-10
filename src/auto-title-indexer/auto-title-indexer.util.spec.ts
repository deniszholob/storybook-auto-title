import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { autoTitleIndexer } from './auto-title-indexer.util';
import type { IndexInput, Indexer } from 'storybook/internal/types';

function createMockIndexer(entries: IndexInput[]): Indexer {
  return {
    createIndex: async () => entries,
  } as unknown as Indexer;
}

describe('autoTitleIndexer', () => {
  test('uses options.makeTitle when entry.title is missing', async () => {
    const indexer = createMockIndexer([{ name: 'A story' } as IndexInput]);

    const wrapped = await autoTitleIndexer()([indexer]);
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

    const wrapped = await autoTitleIndexer()([indexer]);
    const entries = await wrapped[0].createIndex('anything', {});

    expect(entries[0].title).toBe('A/B');
    expect((entries[0] as IndexInput & { __id?: string }).__id).toBeUndefined();
  });

  test('supports stripPrefixes', async () => {
    const indexer = createMockIndexer([
      { title: 'libs/ui/src/lib/button/button.component' } as IndexInput,
    ]);

    const wrapped = await autoTitleIndexer({
      stripPrefixes: ['libs/ui/src/lib/'],
    })([indexer]);

    const entries = await wrapped[0].createIndex('anything', {});
    expect(entries[0].title).toBe('Button');
  });

  test('adds custom strip suffixes by default', async () => {
    const indexer = createMockIndexer([{ title: 'ui/hero/hero.widget' } as IndexInput]);

    const wrapped = await autoTitleIndexer({
      stripSegmentSuffixes: ['widget'],
    })([indexer]);

    const entries = await wrapped[0].createIndex('anything', {});
    expect(entries[0].title).toBe('Ui/Hero');
  });

  test('replaces default strip suffixes when configured', async () => {
    const indexer = createMockIndexer([{ title: 'ui/hero/hero.component' } as IndexInput]);

    const wrapped = await autoTitleIndexer({
      stripSegmentSuffixes: ['widget'],
      stripSegmentSuffixesMode: 'replace',
    })([indexer]);

    const entries = await wrapped[0].createIndex('anything', {});
    expect(entries[0].title).toBe('Ui/Hero Component');
  });

  test('adds file suffix to matching story name when suffix is not stripped', async () => {
    const indexer = createMockIndexer([
      { title: 'ui/tooltip/tooltip.directive', name: 'Tooltip' } as IndexInput,
    ]);

    const wrapped = await autoTitleIndexer({
      stripSegmentSuffixes: [],
      stripSegmentSuffixesMode: 'replace',
    })([indexer]);

    const entries = await wrapped[0].createIndex('ui/tooltip/tooltip.directive.stories.ts', {});
    expect(entries[0].name).toBe('Tooltip Directive');
  });

  test('removes file suffix from matching story name when suffix is stripped', async () => {
    const indexer = createMockIndexer([
      { title: 'ui/tooltip/tooltip.directive', name: 'Tooltip Directive' } as IndexInput,
    ]);

    const wrapped = await autoTitleIndexer()([indexer]);

    const entries = await wrapped[0].createIndex('ui/tooltip/tooltip.directive.stories.ts', {});
    expect(entries[0].name).toBe('Tooltip');
  });

  test('keeps component nested when folder has nested story artifacts', async () => {
    const tmpRoot = await mkdtemp(join(tmpdir(), 'sb-auto-title-'));
    const storyFile = join(tmpRoot, 'main-menu', 'main-menu.component.stories.ts');
    const nestedContentStory = join(
      tmpRoot,
      'main-menu',
      'content',
      'content.component.stories.ts',
    );

    await mkdir(join(tmpRoot, 'main-menu', 'content'), { recursive: true });
    await writeFile(storyFile, '// story');
    await writeFile(nestedContentStory, '// nested story');

    try {
      const indexer = createMockIndexer([
        { title: 'components/basics/main-menu/main-menu.component' } as IndexInput,
      ]);

      const wrapped = await autoTitleIndexer({
        stripSegmentSuffixes: [],
        stripSegmentSuffixesMode: 'replace',
      })([indexer]);

      const entries = await wrapped[0].createIndex(storyFile, {});
      expect(entries[0].title).toBe('Components/Basics/Main Menu/Main Menu Component');
    } finally {
      await rm(tmpRoot, { recursive: true, force: true });
    }
  });

  test('humanizes mdx file-derived names', async () => {
    const indexer = createMockIndexer([
      {
        title: 'ng-template-typed/ng-template-type-example.example',
        name: 'ng-template-type-example.example',
      } as IndexInput,
    ]);

    const wrapped = await autoTitleIndexer({
      stripSegmentSuffixes: [],
      stripSegmentSuffixesMode: 'replace',
    })([indexer]);

    const entries = await wrapped[0].createIndex(
      'ng-template-typed/ng-template-type-example.example.mdx',
      {},
    );
    expect(entries[0].title).toBe('Ng Template Typed/Ng Template Type Example Example');
    expect(entries[0].name).toBe('Ng Template Type Example Example');
  });

  test('humanizes raw single-segment title and docs name', async () => {
    const indexer = createMockIndexer([
      {
        title: 'ng-template-typed',
        name: 'ng-template-type-example.example',
      } as IndexInput,
    ]);

    const wrapped = await autoTitleIndexer({
      stripSegmentSuffixes: [],
      stripSegmentSuffixesMode: 'replace',
    })([indexer]);

    const entries = await wrapped[0].createIndex(
      'ng-template-typed/ng-template-type-example.example.mdx',
      {},
    );
    expect(entries[0].title).toBe('Ng Template Typed');
    expect(entries[0].name).toBe('Ng Template Type Example Example');
  });

  test('humanizes raw dotted names even when file base cannot be matched', async () => {
    const indexer = createMockIndexer([
      {
        title: 'ng-template-typed',
        name: 'ng-template-type-example.example',
      } as IndexInput,
    ]);

    const wrapped = await autoTitleIndexer()([indexer]);

    const entries = await wrapped[0].createIndex('virtual/unknown-file.ts', {});
    expect(entries[0].name).toBe('Ng Template Type Example Example');
  });
});
