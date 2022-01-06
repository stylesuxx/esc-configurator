import React from 'react';
import {
  render, screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let App;

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));
jest.mock('i18next', () => ({ changeLanguage: () => null }));

describe('App', () => {
  beforeAll(async () => {
    /**
     * require component instead of import so that we can properly
     * pre-populate the local storage
     */
    App = require('../').default;
  });

  test('should render container', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByAltText(/Discord/i)).toBeInTheDocument();

    // Ensure that a warning is displayed when no web Serial is detected
    expect(screen.getByText(/is not supported on your browser/i)).toBeInTheDocument();

    // Ensure that the footer is there
    expect(screen.getByText(/statusbarPortUtilization/i)).toBeInTheDocument();
    expect(screen.getByText(/statusbarPacketError/i)).toBeInTheDocument();
  });

  test('should open the settings', () => {
    render(<App />);

    userEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByText(/settingsHeader/i)).toBeInTheDocument();
  });

  test('should open the melody editor', () => {
    render(<App />);

    userEvent.click(screen.getByRole('button', { name: /openMelodyEditor/i }));
    expect(screen.getByText(/melodyEditorHeader/i)).toBeInTheDocument();
  });
});
