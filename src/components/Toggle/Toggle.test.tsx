import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { MIN_TOUCH_TARGET } from '../../theme/tokens';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  it('is exposed as a switch named by its label', async () => {
    await render(<Toggle label="Email reminders" value={false} onValueChange={jest.fn()} />);

    expect(screen.getByRole('switch', { name: 'Email reminders' })).toBeOnTheScreen();
  });

  it('announces its checked state', async () => {
    const { rerender } = await render(<Toggle label="Email reminders" value={false} onValueChange={jest.fn()} />);
    expect(screen.getByRole('switch', { name: 'Email reminders' })).not.toBeChecked();

    await rerender(<Toggle label="Email reminders" value onValueChange={jest.fn()} />);
    expect(screen.getByRole('switch', { name: 'Email reminders' })).toBeChecked();
  });

  it('requests the opposite value when pressed', async () => {
    const onValueChange = jest.fn();
    await render(<Toggle label="Email reminders" value={false} onValueChange={onValueChange} />);

    await fireEvent.press(screen.getByRole('switch', { name: 'Email reminders' }));

    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('requests false when it is currently on', async () => {
    const onValueChange = jest.fn();
    await render(<Toggle label="Email reminders" value onValueChange={onValueChange} />);

    await fireEvent.press(screen.getByRole('switch', { name: 'Email reminders' }));

    expect(onValueChange).toHaveBeenCalledWith(false);
  });

  it('ignores presses and is announced disabled when disabled', async () => {
    const onValueChange = jest.fn();
    await render(<Toggle label="Email reminders" value={false} onValueChange={onValueChange} disabled />);
    const toggle = screen.getByRole('switch', { name: 'Email reminders' });

    await fireEvent.press(toggle);

    expect(toggle).toBeDisabled();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('makes the whole row a large enough touch target', async () => {
    await render(<Toggle label="Email reminders" value={false} onValueChange={jest.fn()} />);

    expect(screen.getByRole('switch', { name: 'Email reminders' })).toHaveStyle({ minHeight: MIN_TOUCH_TARGET });
  });
});
