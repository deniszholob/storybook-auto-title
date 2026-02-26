import type { Preview } from '@storybook/html-vite';

const preview: Preview = {
  parameters: {
    docs: {
      toc: true,
    },
    controls: {
      expanded: true,
    },
  },
};

export default preview;
