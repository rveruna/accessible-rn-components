import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import App from './App';

describe('the example form', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('says "Preferences saved" only after a save finishes, not when an error is fixed', async () => {
    await render(<App />);
    const email = screen.getByLabelText('Email');
    const save = screen.getByRole('button', { name: 'Save preferences' });

    await fireEvent.changeText(email, 'alex@mail');
    await fireEvent.press(save);
    expect(screen.getByText('Enter a valid email address')).toBeOnTheScreen();

    // Fixing the address clears the error but has not saved anything yet
    await fireEvent.changeText(email, 'alex@mail.com');
    expect(screen.queryByText(/Preferences saved/)).not.toBeOnTheScreen();

    await fireEvent.press(save);
    expect(screen.queryByText(/Preferences saved/)).not.toBeOnTheScreen();
    await act(() => jest.advanceTimersByTime(1200));
    expect(screen.getByText(/Preferences saved/)).toBeOnTheScreen();
  });

  it('hides "Preferences saved" again once the email is edited', async () => {
    await render(<App />);
    await fireEvent.changeText(screen.getByLabelText('Email'), 'alex@mail.com');
    await fireEvent.press(screen.getByRole('button', { name: 'Save preferences' }));
    await act(() => jest.advanceTimersByTime(1200));

    await fireEvent.changeText(screen.getByLabelText('Email'), 'alex@mail.co');

    expect(screen.queryByText(/Preferences saved/)).not.toBeOnTheScreen();
  });
});
