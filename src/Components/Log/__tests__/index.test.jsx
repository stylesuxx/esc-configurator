import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Log from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

test('loads and displays Log', () => {
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

test('expands Log', () => {
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
