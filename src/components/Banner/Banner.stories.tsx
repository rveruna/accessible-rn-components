import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Banner } from './Banner';

const meta = {
  title: 'Components/Banner',
  component: Banner,
  args: { kind: 'info', message: 'Your changes are saved automatically.' },
  argTypes: { kind: { control: 'select', options: ['error', 'success', 'info'] } },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {};
export const Success: Story = { args: { kind: 'success', message: 'Preferences saved' } };
export const Error: Story = { args: { kind: 'error', message: 'Payment failed. Check your card details.' } };
