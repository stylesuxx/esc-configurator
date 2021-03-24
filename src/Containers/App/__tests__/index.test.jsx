import React from 'react';
import {
  render, screen, mount,
} from '@testing-library/react';
import App from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

test('loads and displays home', () => {
  render(<App />);
  expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
  expect(screen.getByAltText(/Discord/i)).toBeInTheDocument();

  // Ensure that a warning is displayed when no web Serial is detected
  expect(screen.getByText(/is not supported on your browser/i)).toBeInTheDocument();

  // Ensure that the footer is there
  expect(screen.getByText(/statusbarPortUtilization/i)).toBeInTheDocument();
  expect(screen.getByText(/statusbarPacketError/i)).toBeInTheDocument();
});
