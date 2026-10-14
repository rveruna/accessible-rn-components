import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { fn } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { label: 'Save changes', onPress: fn() },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: 'secondary', label: 'Cancel' } };
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true } };
