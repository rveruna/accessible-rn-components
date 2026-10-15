import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Slider, type SliderProps } from './Slider';

function Controlled({ value: initial, ...props }: Omit<SliderProps, 'onValueChange'>) {
  const [value, setValue] = useState(initial);
  return <Slider {...props} value={value} onValueChange={setValue} />;
}

const meta = {
  title: 'Components/Slider',
  component: Controlled,
  args: {
    label: 'Monthly savings',
    value: 150,
    min: 0,
    max: 500,
    step: 25,
    formatValue: (value: number) => `£${value}`,
  },
  argTypes: { disabled: { control: 'boolean' } },
} satisfies Meta<typeof Controlled>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Money: Story = {};
export const Percent: Story = {
  args: {
    label: 'Risk level',
    value: 40,
    min: 0,
    max: 100,
    step: 1,
    formatValue: (value: number) => `${value}%`,
  },
};
export const Disabled: Story = { args: { disabled: true } };
