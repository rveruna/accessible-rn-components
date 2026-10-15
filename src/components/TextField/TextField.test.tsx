import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { TextField } from './TextField';

const baseProps = { label: 'Email', value: '', onChangeText: jest.fn() };

describe('TextField', () => {
  it('labels the input with its visible label', async () => {
    await render(<TextField {...baseProps} />);

    expect(screen.getByLabelText('Email')).toBeOnTheScreen();
  });

  it('reports typed text', async () => {
    const onChangeText = jest.fn();
    await render(<TextField {...baseProps} onChangeText={onChangeText} />);

    await fireEvent.changeText(screen.getByLabelText('Email'), 'ada@example.com');

    expect(onChangeText).toHaveBeenCalledWith('ada@example.com');
  });

  it('uses helper text as the accessibility hint and shows it', async () => {
    await render(<TextField {...baseProps} helperText="We never share your email" />);

    expect(screen.getByText('We never share your email')).toBeOnTheScreen();
    expect(screen.getByLabelText('Email')).toHaveProp('accessibilityHint', 'We never share your email');
  });

  it('announces an error as an alert and marks the field invalid', async () => {
    await render(<TextField {...baseProps} error="Enter a valid email" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email');
    expect(screen.getByLabelText('Email')).toHaveProp('aria-invalid', true);
  });

  it('prefers the error over helper text for the hint and visible message', async () => {
    await render(
      <TextField {...baseProps} helperText="We never share your email" error="Enter a valid email" />,
    );

    expect(screen.getByLabelText('Email')).toHaveProp('accessibilityHint', 'Enter a valid email');
    expect(screen.queryByText('We never share your email')).not.toBeOnTheScreen();
  });

  it('does not render an alert when there is no error', async () => {
    await render(<TextField {...baseProps} />);

    expect(screen.queryByRole('alert')).not.toBeOnTheScreen();
  });

  it('is marked disabled and not editable when editable is false', async () => {
    await render(<TextField {...baseProps} editable={false} />);
    const input = screen.getByLabelText('Email');

    expect(input).toBeDisabled();
    expect(input).toHaveProp('editable', false);
  });

  it('hides typed characters for secure entry', async () => {
    await render(<TextField {...baseProps} label="Password" secureTextEntry />);

    expect(screen.getByLabelText('Password')).toHaveProp('secureTextEntry', true);
  });
});
