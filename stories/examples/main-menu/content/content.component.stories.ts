import type { Meta, StoryObj } from '@storybook/html-vite';

type ContentArgs = {
  text: string;
};

const meta: Meta<ContentArgs> = {};
export default meta;

export const Content: StoryObj<ContentArgs> = {
  args: {
    text: 'Main content area',
  },
  render: ({ text }) => {
    const section = document.createElement('section');
    section.style.border = '1px dashed #cbd5e1';
    section.style.borderRadius = '0.5rem';
    section.style.padding = '0.75rem';
    section.style.fontFamily = 'ui-sans-serif, system-ui, sans-serif';
    section.textContent = text;
    return section;
  },
};
