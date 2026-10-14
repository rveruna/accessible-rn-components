import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Banner } from './Banner';

describe('Banner', () => {
  it('announces errors as an assertive alert', async () => {
    await render(<Banner kind="error" message="Payment failed" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Error: Payment failed');
    expect(alert).toHaveProp('accessibilityLiveRegion', 'assertive');
  });

  it.each([
    ['success', 'Success: Saved'],
    ['info', 'Note: Saved'],
  ] as const)('announces %s as a polite status', async (kind, expectedText) => {
    await render(<Banner kind={kind} message="Saved" />);

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent(expectedText);
    expect(status).toHaveProp('accessibilityLiveRegion', 'polite');
  });

  it('does not rely on colour alone to convey the kind', async () => {
    await render(<Banner kind="error" message="Payment failed" />);

    expect(screen.getByText('Error:')).toBeOnTheScreen();
  });

  it('does not use the alert role for non-errors', async () => {
    await render(<Banner kind="info" message="Heads up" />);

    expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
  });
});
