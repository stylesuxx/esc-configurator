import React from 'react';
import {
  render, screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

let App;

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));
jest.mock('i18next', () => ({
  changeLanguage: () => null,
  t: () => null,
}));

describe('App', () => {
  beforeAll(async () => {
    /**
     * require component instead of import so that we can properly
     * pre-populate the local storage
     */
    App = require('../').default;
  });

  test('should render', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByAltText(/Discord/i)).toBeInTheDocument();

    expect(screen.getByText(/is not supported on your browser/i)).toBeInTheDocument();

    expect(screen.getByText(/statusbarPortUtilization/i)).toBeInTheDocument();
    expect(screen.getByText(/statusbarPacketError/i)).toBeInTheDocument();

    expect(screen.getByText(/cookieText/i)).toBeInTheDocument();
  });

  test('should allow to open the settings', () => {
    render(<App />);

    userEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByText(/settingsHeader/i)).toBeInTheDocument();
  });

  test('should allow to open the melody editor', () => {
    render(<App />);

    userEvent.click(screen.getByRole('button', { name: /openMelodyEditor/i }));
    expect(screen.getByText(/melodyEditorHeader/i)).toBeInTheDocument();
  });

  test('should be possible to allow cookies', () => {
    render(<App />);

    userEvent.click(screen.getByRole('button', { name: /allow/i }));
  });
});
