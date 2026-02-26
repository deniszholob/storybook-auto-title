import { humanizeSegment, defaultFlattenTitle } from './util.util';

// File Level Tests
describe('Util Utilities', () => {
  // Function level tests
  describe('humanizeSegment', () => {
    test('removes .component suffix', () => {
      expect(humanizeSegment('catalog-recipe-form.component')).toBe('Catalog Recipe Form');
    });

    test('handles kebab/snake/dot case', () => {
      expect(humanizeSegment('foo-bar_baz.qux')).toBe('Foo Bar Baz Qux');
    });

    test('removes .stories suffix', () => {
      expect(humanizeSegment('button.stories')).toBe('Button');
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
  });
});
