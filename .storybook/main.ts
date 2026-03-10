import type { StorybookConfig } from '@storybook/html-vite';
import { autoTitleIndexer, type AutoTitleOptions } from '../src/';

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  experimental_indexers: autoTitleIndexer({
    // stripSegmentSuffixes: [],
    // stripSegmentSuffixesMode: 'replace',
    // stripPrefixes: ['stories/'],
  } satisfies AutoTitleOptions),
  viteFinal: async (viteConfig) => {
    if (process.env.GITHUB_ACTIONS === 'true') {
      const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
      if (repoName) {
        viteConfig.base = `/${repoName}/`;
      }
    }
    return viteConfig;
  },
};

export default config;
