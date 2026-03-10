import {
  humanizeSegment,
  defaultFlattenTitle,
  resolveStripSegmentSuffixes,
  DEFAULT_STRIP_SEGMENT_SUFFIXES,
} from './util.util';

// File Level Tests
describe('Util Utilities', () => {
  // Function level tests
  describe('humanizeSegment', () => {
    test('removes .component suffix', () => {
      expect(humanizeSegment('catalog-recipe-form.component')).toBe('Catalog Recipe Form');
    });

    test('removes .directive suffix', () => {
      expect(humanizeSegment('catalog-recipe-form.directive')).toBe('Catalog Recipe Form');
    });

    test('removes .service suffix', () => {
      expect(humanizeSegment('catalog-recipe-form.service')).toBe('Catalog Recipe Form');
    });

    test('handles kebab/snake/dot case', () => {
      expect(humanizeSegment('foo-bar_baz.qux')).toBe('Foo Bar Baz Qux');
    });

    test('removes .stories suffix', () => {
      expect(humanizeSegment('button.stories')).toBe('Button');
    });

    test('removes angular suffixes by default', () => {
      expect(humanizeSegment('status.pipe')).toBe('Status');
      expect(humanizeSegment('auth.guard')).toBe('Auth');
    });

    test('supports custom suffix list', () => {
      expect(humanizeSegment('hero.widget', undefined, ['widget'])).toBe('Hero');
      expect(humanizeSegment('hero.widget', undefined, ['component'])).toBe('Hero Widget');
    });
  });

  describe('defaultFlattenTitle', () => {
    test('humanizes and preserves hierarchy', () => {
      const input =
        'components/production-chain-editor/catalog-recipe-form/catalog-recipe-form.component';
      expect(defaultFlattenTitle(input, { dedupeAdjacent: true })).toBe(
        'Components/Production Chain Editor/Catalog Recipe Form',
      );
    });

    test('dedupes adjacent duplicates', () => {
      const input = 'ui/button/button';
      expect(defaultFlattenTitle(input, { dedupeAdjacent: true })).toBe('Ui/Button');
      expect(defaultFlattenTitle(input, { dedupeAdjacent: false })).toBe('Ui/Button/Button');
    });

    test('dedupes folder + suffixed file segment', () => {
      const input = 'components/basics/background-dust/background-dust.component';
      expect(
        defaultFlattenTitle(input, {
          dedupeAdjacent: true,
          stripSegmentSuffixes: [],
        }),
      ).toBe('Components/Basics/Background Dust Component');
    });

    test('keeps folder + suffixed file segment when collapse is disabled', () => {
      const input = 'components/basics/main-menu/main-menu.component';
      expect(
        defaultFlattenTitle(input, {
          dedupeAdjacent: true,
          stripSegmentSuffixes: [],
          collapseSuffixedDuplicateSegments: false,
        }),
      ).toBe('Components/Basics/Main Menu/Main Menu Component');
    });
  });

  describe('resolveStripSegmentSuffixes', () => {
    test('adds custom suffixes by default', () => {
      const resolved = resolveStripSegmentSuffixes(['widget']);
      expect(resolved).toContain('widget');
      expect(resolved).toContain('component');
    });

    test('replaces defaults when mode is replace', () => {
      const resolved = resolveStripSegmentSuffixes(['widget', '.presenter'], 'replace');
      expect(resolved).toEqual(['widget', 'presenter']);
      expect(resolved).not.toEqual(DEFAULT_STRIP_SEGMENT_SUFFIXES);
    });
  });
});
