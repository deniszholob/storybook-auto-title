import type { Meta, StoryObj } from '@storybook/html-vite';

type MainMenuArgs = {
  left: string;
  right: string;
};

const meta: Meta<MainMenuArgs> = {};
export default meta;

export const MainMenu: StoryObj<MainMenuArgs> = {
  args: {
    left: 'Navigation',
    right: 'Actions',
  },
  render: ({ left, right }) => {
    const nav = document.createElement('nav');
    nav.style.display = 'grid';
    nav.style.gridTemplateColumns = '1fr 1fr';
    nav.style.gap = '0.5rem';
    nav.style.border = '1px solid #d2d6dc';
    nav.style.borderRadius = '0.5rem';
    nav.style.background = '#ffffff';
    nav.style.color = '#1f2937';
    nav.style.padding = '0.75rem';
    nav.style.minWidth = '16rem';
    nav.style.fontFamily = 'ui-sans-serif, system-ui, sans-serif';

    const leftCol = document.createElement('div');
    leftCol.style.display = 'flex';
    leftCol.style.flexDirection = 'column';
    leftCol.style.gap = '0.25rem';

    const rightCol = document.createElement('div');
    rightCol.style.display = 'flex';
    rightCol.style.flexDirection = 'column';
    rightCol.style.gap = '0.25rem';
    rightCol.style.alignItems = 'flex-end';

    const leftHeader = document.createElement('strong');
    leftHeader.textContent = left;
    const leftItem = document.createElement('span');
    leftItem.textContent = 'Dashboard';

    const rightHeader = document.createElement('strong');
    rightHeader.textContent = right;
    const rightItem = document.createElement('span');
    rightItem.textContent = 'Profile';

    leftCol.append(leftHeader, leftItem);
    rightCol.append(rightHeader, rightItem);
    nav.append(leftCol, rightCol);
    return nav;
  },
};
