import type { Meta, StoryObj } from '@storybook/html-vite';

type TextArgs = {
  content: string;
  size: string;
  weight: string;
  color: string;
};

const meta: Meta<TextArgs> = {};
export default meta;

export const Text: StoryObj<TextArgs> = {
  args: {
    content: 'Example text component',
    size: '16px',
    weight: '400',
    color: '#1f2937',
  },
  render: ({ content, size, weight, color }) => {
    const span = document.createElement('span');
    span.textContent = content;
    span.style.fontSize = size;
    span.style.fontWeight = weight;
    span.style.color = color;
    span.style.fontFamily = 'ui-sans-serif, system-ui, sans-serif';
    return span;
  },
};
