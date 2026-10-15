import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { colors, MIN_TOUCH_TARGET } from '../../theme/tokens';
import { RadioGroup } from './RadioGroup';

const options = [
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'Text message' },
  { value: 'post', label: 'Post' },
];
const key = (name: string) => ({ key: name, preventDefault: jest.fn() });

async function renderGroup(props: Partial<React.ComponentProps<typeof RadioGroup>> = {}) {
  const onValueChange = jest.fn();
  await render(
    <RadioGroup
      label="How should we contact you?"
      options={options}
      value={null}
      onValueChange={onValueChange}
      {...props}
    />,
  );
  return { onValueChange };
}

describe('RadioGroup', () => {
  it('is a radio group named by its question', async () => {
    await renderGroup();

    // A container, not one accessibility element: grouping it would hide the options from VoiceOver
    expect(screen.getByLabelText('How should we contact you?')).toHaveProp('role', 'radiogroup');
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('does not read the question twice', async () => {
    await renderGroup();

    expect(screen.queryByText('How should we contact you?')).toBeNull();
    expect(screen.getByText('How should we contact you?', { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it('announces which option is chosen', async () => {
    await renderGroup({ value: 'sms' });

    expect(screen.getByRole('radio', { name: 'Text message' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Email' })).not.toBeChecked();
  });

  it('chooses an option when it is pressed, and does not re-send the chosen one', async () => {
    const { onValueChange } = await renderGroup({ value: 'sms' });

    await fireEvent.press(screen.getByRole('radio', { name: 'Post' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Text message' }));

    expect(onValueChange.mock.calls).toEqual([['post']]);
  });

  it('is one tab stop: the chosen option, or the first when nothing is chosen', async () => {
    const first = await render(
      <RadioGroup label="Q" options={options} value={null} onValueChange={jest.fn()} />,
    );
    expect(screen.getByRole('radio', { name: 'Email' })).toHaveProp('tabIndex', 0);
    expect(screen.getByRole('radio', { name: 'Post' })).toHaveProp('tabIndex', -1);
    await first.unmount();

    await renderGroup({ value: 'post' });
    expect(screen.getByRole('radio', { name: 'Post' })).toHaveProp('tabIndex', 0);
    expect(screen.getByRole('radio', { name: 'Email' })).toHaveProp('tabIndex', -1);
  });

  it('moves and chooses with the arrow keys, wrapping at the ends', async () => {
    const { onValueChange } = await renderGroup({ value: 'post' });
    const post = screen.getByRole('radio', { name: 'Post' });
    const down = key('ArrowDown');

    await fireEvent(post, 'keyDown', down);
    await fireEvent(post, 'keyDown', key('ArrowUp'));

    expect(onValueChange.mock.calls).toEqual([['email'], ['sms']]);
    expect(down.preventDefault).toHaveBeenCalled();
  });

  it('chooses the focused option with Space, without scrolling the page', async () => {
    const { onValueChange } = await renderGroup();
    const space = key(' ');

    await fireEvent(screen.getByRole('radio', { name: 'Text message' }), 'keyDown', space);

    expect(onValueChange).toHaveBeenCalledWith('sms');
    expect(space.preventDefault).toHaveBeenCalled();
  });

  it('leaves Home, End and other keys to the browser', async () => {
    const { onValueChange } = await renderGroup();
    const radio = screen.getByRole('radio', { name: 'Email' });

    await fireEvent(radio, 'keyDown', key('End'));
    await fireEvent(radio, 'keyDown', key('Tab'));

    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('announces an error as an alert and marks the group invalid', async () => {
    await renderGroup({ error: 'Choose how we should contact you' });

    expect(screen.getByRole('alert')).toHaveTextContent('Choose how we should contact you');
    expect(screen.getByLabelText('How should we contact you?')).toHaveProp('aria-invalid', true);
  });

  it('is announced disabled and ignores presses and keys when disabled', async () => {
    const { onValueChange } = await renderGroup({ disabled: true });
    const email = screen.getByRole('radio', { name: 'Email' });

    await fireEvent.press(email);
    await fireEvent(email, 'keyDown', key(' '));
    await fireEvent(email, 'keyDown', key('ArrowDown'));

    expect(email).toBeDisabled();
    expect(email).toHaveProp('tabIndex', -1);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('gives every option a 44pt touch target', async () => {
    await renderGroup();

    for (const radio of screen.getAllByRole('radio'))
      expect(radio).toHaveStyle({ minHeight: MIN_TOUCH_TARGET });
  });

  it('draws a focus ring on the focused option', async () => {
    await renderGroup();
    const email = screen.getByRole('radio', { name: 'Email' });

    await fireEvent(email, 'focus');
    expect(email).toHaveStyle({ outlineWidth: 3, outlineColor: colors.text });

    await fireEvent(email, 'blur');
    expect(email).not.toHaveStyle({ outlineWidth: 3 });
  });
});
