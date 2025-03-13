import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResetPassword from './ResetPassword';

describe('<ResetPassword />', () => {
  test('it should mount', () => {
    render(<ResetPassword />);

    const ResetPassword = screen.getByTestId('ResetPassword');

    expect(ResetPassword).toBeInTheDocument();
  });
});