import React from 'react';
import { AccessibilityInfo, Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '../Button/Button';
import { Dialog } from './Dialog';

async function renderDialog(visible = true) {
  const onRequestClose = jest.fn();
  await render(
    <Dialog
      visible={visible}
      title="Delete your account?"
      onRequestClose={onRequestClose}
      actions={<Button label="Cancel" variant="secondary" onPress={onRequestClose} />}
    >
      <Text>This removes your data and cannot be undone.</Text>
    </Dialog>,
  );
  return { onRequestClose };
}

const title = () => screen.getByRole('heading', { name: 'Delete your account?' });

/** The nearest element above `element` with this prop: here, the Modal that the dialog renders into. */
function ancestorWith(element: ReturnType<typeof title>, prop: string) {
  let node = element.parent;
  while (node && node.props[prop] === undefined) node = node.parent;
  return node;
}

describe('Dialog', () => {
  afterEach(() => jest.restoreAllMocks());

  it('shows its title as a heading, its content and its actions when visible', async () => {
    await renderDialog();

    expect(screen.getByRole('heading', { name: 'Delete your account?' })).toBeOnTheScreen();
    expect(screen.getByText('This removes your data and cannot be undone.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeOnTheScreen();
  });

  it('shows nothing when not visible', async () => {
    await renderDialog(false);

    expect(screen.queryByRole('heading', { name: 'Delete your account?' })).toBeNull();
  });

  it('keeps VoiceOver inside the dialog', async () => {
    await renderDialog();

    expect(screen.getByRole('heading', { name: 'Delete your account?' }).parent).toHaveProp(
      'accessibilityViewIsModal',
      true,
    );
  });

  it('moves screen reader focus to the title when it opens on iOS and Android', async () => {
    const send = jest.spyOn(AccessibilityInfo, 'sendAccessibilityEvent').mockImplementation(() => {});
    await renderDialog();

    // Events fired inside the dialog bubble up to the Modal's handler, as they would from the native side
    await fireEvent(title(), 'show');

    // Compare props, not the instance: a failing match would try to print the whole component instance
    expect(send).toHaveBeenCalledTimes(1);
    const [target, eventType] = send.mock.calls[0] as unknown as [
      { props: { role: string; children: string } },
      string,
    ];
    expect(eventType).toBe('focus');
    expect(target.props.role).toBe('heading');
    expect(target.props.children).toBe('Delete your account?');
  });

  it('asks to close on the Android back button (and Escape on web)', async () => {
    const { onRequestClose } = await renderDialog();

    await fireEvent(title(), 'requestClose');

    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });

  it('asks to close on a tap outside, which assistive tech never lands on', async () => {
    const { onRequestClose } = await renderDialog();
    const backdrop = screen.getByTestId('dialog-backdrop', { includeHiddenElements: true });

    await fireEvent(backdrop, 'responderRelease');

    expect(onRequestClose).toHaveBeenCalledTimes(1);
    expect(backdrop).not.toBeVisible();
    expect(backdrop.props.onStartShouldSetResponder()).toBe(true);
    // Not focusable on web: no tab stop, and not a Pressable, which the web focus trap would focus on open
    expect(backdrop).not.toHaveProp('tabIndex');
    expect(backdrop).not.toHaveProp('focusable');
  });

  it('is named by its title on web, where it gets role="dialog"', async () => {
    await renderDialog();

    expect(ancestorWith(title(), 'aria-label')).toHaveProp('aria-label', 'Delete your account?');
  });
});
