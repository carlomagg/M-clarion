import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sidebar from './Sidebar';

describe('<Sidebar />', () => {
  test('it should mount', () => {
    render(<Sidebar />);

    const Sidebar = screen.getByTestId('Sidebar');

    expect(Sidebar).toBeInTheDocument();
  });
});