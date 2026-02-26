import type { Meta, StoryObj } from '@storybook/html-vite';

type IconButtonArgs = {
  label: string;
  icon: string;
};

const meta: Meta<IconButtonArgs> = {
  // tags: ['autodocs'],
};
export default meta;

export const Button: StoryObj<IconButtonArgs> = {
  args: {
    label: 'Search',
    icon: '🔍',
  },
  render: ({ label, icon }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.style.display = 'inline-flex';
    button.style.alignItems = 'center';
    button.style.gap = '0.5rem';
    button.style.border = '1px solid #d2d6dc';
    button.style.borderRadius = '0.5rem';
    button.style.background = '#ffffff';
    button.style.color = '#1f2937';
    button.style.padding = '0.5rem 0.75rem';
    button.style.fontFamily = 'ui-sans-serif, system-ui, sans-serif';

    const iconNode = document.createElement('span');
    iconNode.setAttribute('aria-hidden', 'true');
    iconNode.textContent = icon;

    const labelNode = document.createElement('span');
    labelNode.textContent = label;

    button.append(iconNode, labelNode);
    return button;
  },
};
