import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { RadioGroup, type RadioGroupProps } from './RadioGroup';

function Controlled({ value: initial, ...props }: Omit<RadioGroupProps, 'onValueChange'>) {
  const [value, setValue] = useState(initial);
  return <RadioGroup {...props} value={value} onValueChange={setValue} />;
}

const meta = {
  title: 'Components/RadioGroup',
  component: Controlled,
  args: {
    label: 'How should we contact you?',
    options: [
      { value: 'email', label: 'Email' },
      { value: 'sms', label: 'Text message' },
      { value: 'post', label: 'Post' },
    ],
    value: null,
  },
  argTypes: { disabled: { control: 'boolean' } },
} satisfies Meta<typeof Controlled>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NothingChosen: Story = {};
export const Chosen: Story = { args: { value: 'sms' } };
export const WithError: Story = { args: { error: 'Choose how we should contact you' } };
export const Disabled: Story = { args: { value: 'email', disabled: true } };
