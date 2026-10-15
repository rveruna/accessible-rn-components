import React, { useState } from 'react';
import { Text } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Button } from '../Button/Button';
import { Dialog } from './Dialog';

function Example({ startOpen = false }: { startOpen?: boolean }) {
  const [open, setOpen] = useState(startOpen);
  return (
    <>
      <Button label="Delete account" variant="secondary" onPress={() => setOpen(true)} />
      <Dialog
        visible={open}
        title="Delete your account?"
        onRequestClose={() => setOpen(false)}
        actions={
          <>
            <Button label="Cancel" variant="secondary" onPress={() => setOpen(false)} />
            <Button label="Delete" onPress={() => setOpen(false)} />
          </>
        }
      >
        <Text>This removes your saved goals and cannot be undone.</Text>
      </Dialog>
    </>
  );
}

const meta = {
  title: 'Components/Dialog',
  component: Example,
  parameters: {
    docs: {
      description: {
        component:
          'Open it with the keyboard: focus moves into the dialog, Tab stays inside it, Escape closes it and focus returns to the button.',
      },
    },
  },
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};
export const Open: Story = { args: { startOpen: true } };
