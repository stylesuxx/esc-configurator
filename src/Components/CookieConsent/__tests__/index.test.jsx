import React from 'react';
import {
  render, screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CookieConsent from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

let onClick;

describe('CookieConsent', () => {
  beforeEach(() => {
    onClick = jest.fn();
  });

  it('should display', () => {
    render(
      <CookieConsent
        onCookieAccept={onClick}
        show
      />
    );

    expect(screen.getByText(/cookieText/i)).toBeInTheDocument();
    expect(screen.getByText(/allow/i)).toBeInTheDocument();
    expect(screen.getByText(/deny/i)).toBeInTheDocument();
  });

  it('should handle allow button', () => {
    render(
      <CookieConsent
        onCookieAccept={onClick}
        show
      />
    );

    expect(screen.getByText(/cookieText/i)).toBeInTheDocument();
    expect(screen.getByText(/allow/i)).toBeInTheDocument();
    expect(screen.getByText(/deny/i)).toBeInTheDocument();

    userEvent.click(screen.getByText(/allow/i));
    expect(onClick).toHaveBeenCalled();
  });

  it('should handle deny button', () => {
    render(
      <CookieConsent
        onCookieAccept={onClick}
        show
      />
    );

    expect(screen.getByText(/cookieText/i)).toBeInTheDocument();
    expect(screen.getByText(/allow/i)).toBeInTheDocument();
    expect(screen.getByText(/deny/i)).toBeInTheDocument();

    userEvent.click(screen.getByText(/deny/i));
    expect(onClick).toHaveBeenCalled();
  });
});
