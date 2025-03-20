import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationBar from './NotificationBar';

describe('<NotificationBar />', () => {
  test('it should mount', () => {
    render(<NotificationBar />);

    const NotificationBar = screen.getByTestId('NotificationBar');

    expect(NotificationBar).toBeInTheDocument();
  });
});