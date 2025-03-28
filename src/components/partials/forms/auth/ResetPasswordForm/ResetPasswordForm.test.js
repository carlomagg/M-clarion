import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResetPasswordForm from './ResetPasswordForm';

describe('<ResetPasswordForm />', () => {
  test('it should mount', () => {
    render(<ResetPasswordForm />);

    const ResetPasswordForm = screen.getByTestId('ResetPasswordForm');

    expect(ResetPasswordForm).toBeInTheDocument();
  });
});