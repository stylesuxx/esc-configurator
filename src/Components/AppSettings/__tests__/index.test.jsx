import React from 'react';
import {
  render, screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AppSettings from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

describe('AppSettings', () => {
  it('should displays overlay', () => {
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

  it('should handle clicks on checkbox', () => {
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

  it('should close the overlay', () => {
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

  it('should handle invalid setting type', () => {
    const settings = {
      testSetting: {
        type: "string",
        value: "something",
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
  });
});
