import React from 'react';
import {
  render, screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AppSettings from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

test('loads and displays AppSettings', () => {
  const settings = {
    testSetting: {
      type: "boolean",
      value: true,
    },
    testSettingFalse: {
      type: "boolean",
      value: false,
    },
  };

  const onClose = jest.fn();
  const onUpdate = jest.fn();

  render(
    <AppSettings
      onClose={onClose}
      onUpdate={onUpdate}
      settings={settings}
    />
  );

  expect(screen.getByText(/settingsHeader/i)).toBeInTheDocument();
  expect(screen.getByText(/close/i)).toBeInTheDocument();
});

test('processes clicks on checkbox', () => {
  const settings = {
    testSetting: {
      type: "boolean",
      value: true,
    },
  };

  const onClose = jest.fn();
  const onUpdate = jest.fn();

  render(
    <AppSettings
      onClose={onClose}
      onUpdate={onUpdate}
      settings={settings}
    />
  );

  expect(screen.getByText(/settingsHeader/i)).toBeInTheDocument();

  userEvent.click(screen.getByRole(/checkbox/i));
  expect(onUpdate).toHaveBeenCalled();
});

test('processes clicks on close', () => {
  const settings = {};

  const onClose = jest.fn();
  const onUpdate = jest.fn();

  render(
    <AppSettings
      onClose={onClose}
      onUpdate={onUpdate}
      settings={settings}
    />
  );

  userEvent.click(screen.getByText(/close/i));
  expect(onClose).toHaveBeenCalled();
});
