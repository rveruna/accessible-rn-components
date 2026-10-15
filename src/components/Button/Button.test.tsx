import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { MIN_TOUCH_TARGET } from '../../theme/tokens';
import { Button } from './Button';

describe('Button', () => {
  it('is exposed as a button with its label as the accessible name', async () => {
    await render(<Button label="Save changes" onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Save changes' })).toBeOnTheScreen();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    await render(<Button label="Save" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('meets the minimum touch target size', async () => {
    await render(<Button label="Save" onPress={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Save' })).toHaveStyle({
      minHeight: MIN_TOUCH_TARGET,
      minWidth: MIN_TOUCH_TARGET,
    });
  });

  it('is announced as disabled and ignores presses when disabled', async () => {
    const onPress = jest.fn();
    await render(<Button label="Save" onPress={onPress} disabled />);
    const button = screen.getByRole('button', { name: 'Save' });

    await fireEvent.press(button);

    expect(button).toBeDisabled();
    expect(onPress).not.toHaveBeenCalled();
  });

  it('is announced as busy and ignores presses while loading', async () => {
    const onPress = jest.fn();
    await render(<Button label="Save" onPress={onPress} loading />);
    const button = screen.getByRole('button', { name: 'Save' });

    await fireEvent.press(button);

    expect(button).toBeBusy();
    expect(button).toBeDisabled();
    expect(onPress).not.toHaveBeenCalled();
  });

  it('swaps the visible label for a spinner but keeps the accessible name while loading', async () => {
    await render(<Button label="Save" onPress={jest.fn()} loading />);

    expect(screen.queryByText('Save')).not.toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Save' })).toBeOnTheScreen();
  });

  it('passes an accessibility hint through', async () => {
    await render(
      <Button label="Delete" onPress={jest.fn()} accessibilityHint="Removes this item for good" />,
    );

    expect(screen.getByRole('button', { name: 'Delete' })).toHaveProp(
      'accessibilityHint',
      'Removes this item for good',
    );
  });

  it('renders the secondary variant with a visible border', async () => {
    await render(<Button label="Cancel" onPress={jest.fn()} variant="secondary" />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveStyle({ borderWidth: 2 });
  });
});
