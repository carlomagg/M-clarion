import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VerifyOTPForm from './VerifyOTPForm';

describe('<VerifyOTPForm />', () => {
  test('it should mount', () => {
    render(<VerifyOTPForm />);

    const VerifyOTPForm = screen.getByTestId('VerifyOTPForm');

    expect(VerifyOTPForm).toBeInTheDocument();
  });
});