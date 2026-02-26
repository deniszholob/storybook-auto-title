import type { StorybookConfig } from '@storybook/html-vite';
import { withFlattenedAutoTitles } from '../src/with-flattened-auto-titles/with-flattened-auto-titles.util';

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  experimental_indexers: withFlattenedAutoTitles({
    // stripPrefixes: ['stories/'],
  }),
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
