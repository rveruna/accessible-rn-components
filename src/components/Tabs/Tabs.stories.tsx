import React, { useState } from 'react';
import { Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Tabs } from './Tabs';

const sections = [
  { key: 'profile', label: 'Profile', content: <Text>Your name, email and phone number.</Text> },
  { key: 'security', label: 'Security', content: <Text>Your password and two-step sign-in.</Text> },
  { key: 'billing', label: 'Billing', content: <Text>Your plan and past invoices.</Text> },
];

function Controlled({ start }: { start: string }) {
  const [selected, setSelected] = useState(start);
  return (
    <Tabs label="Account sections" tabs={sections} selectedKey={selected} onSelectedChange={setSelected} />
  );
}

const meta = {
  title: 'Components/Tabs',
  component: Controlled,
  args: { start: 'profile' },
  parameters: {
    docs: {
      description: {
        component:
          'One tab stop: Tab moves into the selected tab, the arrow keys move between tabs, Home and End jump.',
      },
    },
  },
} satisfies Meta<typeof Controlled>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstSelected: Story = {};
export const SecondSelected: Story = { args: { start: 'security' } };
