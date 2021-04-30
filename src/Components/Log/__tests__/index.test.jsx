import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Log from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

describe('Log', () => {
  it('should display log messages', () => {
    const messages = [
      'line1',
      'line2',
    ];

    render(
      <Log
        messages={messages}
      />
    );

    expect(screen.getByText(/line1/i)).toBeInTheDocument();
    expect(screen.getByText(/line2/i)).toBeInTheDocument();
    expect(screen.getByText(/showLog/i)).toBeInTheDocument();
  });

  it('should expand log', () => {
    const messages = [
      'line1',
      'line2',
    ];

    render(
      <Log
        messages={messages}
      />
    );

    userEvent.click(screen.getByText(/showLog/i));
    expect(screen.queryByText(/showLog/i)).not.toBeInTheDocument();
    expect(screen.getByText(/hideLog/i)).toBeInTheDocument();
  });
});
