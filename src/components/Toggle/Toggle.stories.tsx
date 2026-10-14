import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Toggle, type ToggleProps } from './Toggle';

function Controlled({ value: initial, ...props }: Omit<ToggleProps, 'onValueChange'>) {
  const [value, setValue] = useState(initial);
  return <Toggle {...props} value={value} onValueChange={setValue} />;
}

const meta = {
  title: 'Components/Toggle',
  component: Controlled,
  args: { label: 'Email reminders', value: false },
  argTypes: { disabled: { control: 'boolean' } },
} satisfies Meta<typeof Controlled>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};
export const On: Story = { args: { value: true } };
export const Disabled: Story = { args: { disabled: true } };
