import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { TextField, type TextFieldProps } from './TextField';

function Controlled(props: Omit<TextFieldProps, 'value' | 'onChangeText'>) {
  const [value, setValue] = useState('');
  return <TextField {...props} value={value} onChangeText={setValue} />;
}

const meta = {
  title: 'Components/TextField',
  component: Controlled,
  args: { label: 'Email' },
  argTypes: {
    helperText: { control: 'text' },
    error: { control: 'text' },
    secureTextEntry: { control: 'boolean' },
    editable: { control: 'boolean' },
  },
} satisfies Meta<typeof Controlled>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHelperText: Story = { args: { helperText: 'We only use this to send reminders' } };
export const WithError: Story = { args: { error: 'Enter a valid email address' } };
export const Password: Story = { args: { label: 'Password', secureTextEntry: true } };
export const ReadOnly: Story = { args: { editable: false } };
