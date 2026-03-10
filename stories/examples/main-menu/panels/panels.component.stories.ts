import type { Meta, StoryObj } from '@storybook/html-vite';

type PanelsArgs = {
  count: number;
};

const meta: Meta<PanelsArgs> = {};
export default meta;

export const MenuLeft: StoryObj<PanelsArgs> = {
  args: {
    count: 3,
  },
  render: ({ count }) => {
    const wrap = document.createElement('div');
    wrap.style.display = 'grid';
    wrap.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
    wrap.style.gap = '0.5rem';
    wrap.style.fontFamily = 'ui-sans-serif, system-ui, sans-serif';

    for (let i = 0; i < count; i += 1) {
      const panel = document.createElement('div');
      panel.style.border = '1px solid #d2d6dc';
      panel.style.borderRadius = '0.5rem';
      panel.style.padding = '0.5rem';
      panel.textContent = `Panel ${i + 1}`;
      wrap.append(panel);
    }

    return wrap;
  },
};

export const MenuRight: StoryObj<PanelsArgs> = {
  args: {
    count: 3,
  },
  render: ({ count }) => {
    const wrap = document.createElement('div');
    wrap.style.display = 'grid';
    wrap.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
    wrap.style.gap = '0.5rem';
    wrap.style.fontFamily = 'ui-sans-serif, system-ui, sans-serif';

    for (let i = 0; i < count; i += 1) {
      const panel = document.createElement('div');
      panel.style.border = '1px solid #d2d6dc';
      panel.style.borderRadius = '0.5rem';
      panel.style.padding = '0.5rem';
      panel.textContent = `Panel ${i + 1}`;
      wrap.append(panel);
    }

    return wrap;
  },
};
