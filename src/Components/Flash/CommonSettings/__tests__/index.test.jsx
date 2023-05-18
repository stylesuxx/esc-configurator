import React from 'react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CustomSettings from '../';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: {
      exists: (name) => {
        if(name === 'hints:STARTUP_BEEP') {
          return false;
        }

        return true;
      },
    },
  }),
}));

describe('CommonSettings', () => {
  it('should display when settings are unsopported', () => {
    const availableSettings = {
      LAYOUT_REVISION: 203,
      MAIN_REVISION: 1,
      NAME: 'FW name',
      SUB_REVISION: 100,
    };

    const escs = [
      {
        meta: { available: true },
        settings: { MODE: 1 },
      },
    ];

    const onFlash = jest.fn();
    const onSettingsUpdate = jest.fn();

    render(
      <CustomSettings
        availableSettings={availableSettings}
        directInput={false}
        escs={escs}
        index={0}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
        unsupported={false}
      />
    );

    expect(screen.getByText(/common:versionUnsupportedLine1/i)).toBeInTheDocument();
    expect(screen.getByText(/common:versionUnsupportedLine2/i)).toBeInTheDocument();
  });

  it('should display custom settings', () => {
    const availableSettings = {
      LAYOUT_REVISION: 203,
      MAIN_REVISION: 1,
      NAME: 'FW name',
      SUB_REVISION: 100,
      _PPM_MIN_THROTTLE: 1200,
    };

    const escs = [
      {
        firmwareName: 'Bluejay',
        layoutRevision: 207,
        meta: { available: true },
        settings: { MODE: 0 },
        make: 'make 1234',
        individualSettings: {
          MAIN_REVISION: 0,
          SUB_REVISION: 201,
          NAME: 'Bluejay (Beta)',
        },
        source: { getGroupOrder: () => [] },
      },
    ];

    const onFlash = jest.fn();
    const onSettingsUpdate = jest.fn();

    render(
      <CustomSettings
        availableSettings={availableSettings}
        directInput={false}
        escs={escs}
        index={0}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
        unsupported={false}
      />
    );

    expect(screen.getByText(/commonParameters/i)).toBeInTheDocument();

    expect(screen.getByText(/escMinStartupPower/i)).toBeInTheDocument();

    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
  });

  it('should allow updating settings', () => {
    const availableSettings = {
      LAYOUT_REVISION: 203,
      MAIN_REVISION: 1,
      NAME: 'FW name',
      SUB_REVISION: 100,
      STARTUP_BEEP: 0,
      MOTOR_DIRECTION: 1,
      _PPM_MIN_THROTTLE: 1200,
    };

    const esc = {
      firmwareName: 'Bluejay',
      layoutRevision: 207,
      meta: { available: true },
      settings: {
        MODE: 0,
        STARTUP_BEEP: 0,
      },
      make: 'make 1234',
      individualSettings: {
        MAIN_REVISION: 0,
        SUB_REVISION: 201,
        NAME: 'Bluejay (Beta)',
      },
    };

    const escs = [];

    for(let i = 0; i < 4; i += 1) {
      const current = { ...esc };
      escs.push(current);
    }

    const onFlash = jest.fn();
    const onSettingsUpdate = jest.fn();

    render(
      <CustomSettings
        availableSettings={availableSettings}
        directInput={false}
        escs={escs}
        index={0}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
        unsupported={false}
      />
    );

    userEvent.click(screen.getByRole(/checkbox/i, { name: 'DITHERING' }));
    expect(onSettingsUpdate).toHaveBeenCalled();

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'TEMPERATURE_PROTECTION' }), {
      taget: {
        value: 3,
        name: 'TEMPERATURE_PROTECTION',
      },
    });
  });

  it('should allow updating with direct input', () => {
    const availableSettings = {
      LAYOUT_REVISION: 203,
      MAIN_REVISION: 1,
      NAME: 'FW name',
      SUB_REVISION: 100,
      _PPM_MIN_THROTTLE: 1200,
    };

    const escs = [
      {
        firmwareName: 'Bluejay',
        layoutRevision: 207,
        meta: { available: true },
        settings: { MODE: 0 },
        make: 'make 1234',
        individualSettings: {
          MAIN_REVISION: 0,
          SUB_REVISION: 201,
          NAME: 'Bluejay (Beta)',
        },
      },
    ];

    const onFlash = jest.fn();
    const onSettingsUpdate = jest.fn();

    render(
      <CustomSettings
        availableSettings={availableSettings}
        directInput
        escs={escs}
        index={0}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
        unsupported={false}
      />
    );

    expect(screen.queryByText(/unsupportedFirmware/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId('STARTUP_POWER_MIN'), {
      target: {
        value: 1250,
        name: 'STARTUP_POWER_MIN',
      },
    });
    fireEvent.blur(screen.getByTestId('STARTUP_POWER_MIN'));
  });

  it('should handle out of sync settings', () => {
    const availableSettings = {
      LAYOUT_REVISION: 201,
      MAIN_REVISION: 0,
      NAME: 'FW name',
      SUB_REVISION: 100,
      _PPM_MIN_THROTTLE: 1200,
      _PPM_CENTER_THROTTLE: 1010,
    };

    const esc = {
      firmwareName: 'Bluejay',
      layoutRevision: 207,
      meta: { available: true },
      settings: {
        MODE: 0,
        MOTOR_DIRECTION: 0,
      },
      make: 'make 1234',
      individualSettings: {
        MAIN_REVISION: 0,
        SUB_REVISION: 201,
        NAME: 'Bluejay (Beta)',
      },
    };

    const escs = [];

    for(let i = 0; i < 4; i += 1) {
      const current = JSON.parse(JSON.stringify(esc));

      if(i === 3) {
        current.settings.MOTOR_DIRECTION = 1;
      }
      escs.push(current);
    }

    const onFlash = jest.fn();
    const onSettingsUpdate = jest.fn();

    render(
      <CustomSettings
        availableSettings={availableSettings}
        directInput={false}
        escs={escs}
        index={0}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
        unsupported={false}
      />
    );

    userEvent.click(screen.getByRole(/checkbox/i, { name: 'DITHERING' }));
    expect(onSettingsUpdate).toHaveBeenCalled();

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'TEMPERATURE_PROTECTION' }), {
      taget: {
        value: 3,
        name: 'TEMPERATURE_PROTECTION',
      },
    });
  });

  it('should display warning when firmware is unsopported', () => {
    const availableSettings = {};

    const escs = [
      {
        firmwareName: 'JESC',
        meta: { available: true },
        settings: { MODE: 1 },
      },
    ];

    const onFlash = jest.fn();
    const onSettingsUpdate = jest.fn();

    render(
      <CustomSettings
        availableSettings={availableSettings}
        directInput={false}
        escs={escs}
        index={0}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
        unsupported
      />
    );

    expect(screen.getByText(/unsupportedFirmware/i)).toBeInTheDocument();
    expect(screen.getByText(/common:useDedicatedConfigurator/i)).toBeInTheDocument();
  });
});
