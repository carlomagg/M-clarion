import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';

describe('<Login />', () => {
  test('it should mount', () => {
    render(<Login />);

    const Login = screen.getByTestId('Login');

    expect(Login).toBeInTheDocument();
  });
});