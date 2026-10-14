import type { Preview } from '@storybook/react-native-web-vite';

const preview: Preview = {
  parameters: {
    a11y: { test: 'error' },
    layout: 'padded',
  },
};

export default preview;
