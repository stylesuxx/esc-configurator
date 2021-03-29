import React from 'react';
import {
  render, screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Changelog from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

test('loads and displays Changelog', () => {
  const entries = [
    {
      title: 'title',
      items: [
        'item'
      ]
    }
  ];

  render(
    <Changelog
      entries={entries}
    />
  );

  expect(screen.getByText(/defaultChangelogHead/i)).toBeInTheDocument();
  expect(screen.getByText(/defaultChangelogTitle/i)).toBeInTheDocument();
  expect(screen.queryByText(/changelogClose/i)).not.toBeInTheDocument();
});


test('expands and close Changelog', () => {
  const entries = [
    {
      title: 'title',
      items: [
        'item'
      ]
    }
  ];

  render(
    <Changelog
      entries={entries}
    />
  );

  userEvent.click(screen.getByText(/defaultChangelogTitle/i));
  expect(screen.queryByText(/defaultChangelogTitle/i)).not.toBeInTheDocument();
  expect(screen.getByText(/changelogClose/i)).toBeInTheDocument();

  userEvent.click(screen.getByText(/changelogClose/i));
  expect(screen.getByText(/defaultChangelogTitle/i)).toBeInTheDocument();
  expect(screen.queryByText(/changelogClose/i)).not.toBeInTheDocument();
});
