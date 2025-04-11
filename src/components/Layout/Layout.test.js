import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Layout from './Layout';

describe('<Layout />', () => {
  test('it should mount', () => {
    render(<Layout />);

    const Layout = screen.getByTestId('Layout');

    expect(Layout).toBeInTheDocument();
  });
});