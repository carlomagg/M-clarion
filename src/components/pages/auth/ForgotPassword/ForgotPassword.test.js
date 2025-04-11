import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ForgotPassword from './ForgotPassword';

describe('<ForgotPassword />', () => {
  test('it should mount', () => {
    render(<ForgotPassword />);

    const ForgotPassword = screen.getByTestId('ForgotPassword');

    expect(ForgotPassword).toBeInTheDocument();
  });
});