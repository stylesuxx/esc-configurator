import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';

import Flash from '../';

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

describe('Flash', () => {
  let onFirmwareDump;
  let onFlash;
  let onIndividualSettingsUpdate;
  let onCommonSettingsUpdate;
  let onSettingsUpdate;

  beforeEach(() => {
    onFirmwareDump = jest.fn();
    onFlash = jest.fn();
    onIndividualSettingsUpdate = jest.fn();
    onCommonSettingsUpdate = jest.fn();
    onSettingsUpdate = jest.fn();
  });

  it('should load and display unsupported custom settings', () => {
    const availableSettings = {
      LAYOUT_REVISION: 203,
      MAIN_REVISION: 1,
      NAME: 'FW name',
      SUB_REVISION: 100,
    };

    const escs = [
      {
        index: 0,
        meta: { available: true },
        settings: { MODE: 0 },
        make: 'make 1234',
        settingsDescriptions: {
          base: [
            {
              name: 'MOTOR_DIRECTION',
              type: 'enum',
              label: 'escMotorDirection',
              options: [
                {
                  value: '1',
                  label: 'Normal',
                },
                {
                  value: '2',
                  label: 'Reversed',
                },
                {
                  value: '3',
                  label: 'Bidirectional',
                },
                {
                  value: '4',
                  label: 'Bidirectional Reversed',
                },
              ],
            },
            {
              name: '_PPM_MIN_THROTTLE',
              type: 'number',
              min: 1000,
              max: 1500,
              step: 4,
              label: 'escPPMMinThrottle',
              offset: 1000,
              factor: 4,
              suffix: ' μs',
            },
            {
              name: 'STARTUP_BEEP',
              type: 'bool',
              label: 'escStartupBeep',
            },
            {
              name: 'IVALID',
              type: 'IVALID',
              label: 'invalid',
            },
            {
              name: '_PPM_CENTER_THROTTLE',
              type: 'number',
              min: 1000,
              max: 2020,
              step: 4,
              label: 'escPPMCenterThrottle',
              offset: 1000,
              factor: 4,
              suffix: ' μs',
              visibleIf: (settings) => [3, 4].includes(settings.MOTOR_DIRECTION),
            },
          ],
        },
        individualSettings: {
          MAIN_REVISION: 0,
          SUB_REVISION: 201,
          NAME: 'Bluejay (Beta)',
        },
      },
    ];

    render(
      <Flash
        availableSettings={availableSettings}
        canFlash={false}
        escCount={1}
        escs={escs}
        onCommonSettingsUpdate={onCommonSettingsUpdate}
        onFirmwareDump={onFirmwareDump}
        onFlash={onFlash}
        onIndividualSettingsUpdate={onIndividualSettingsUpdate}
        onSettingsUpdate={onSettingsUpdate}
      />
    );

    expect(screen.getByText(/commonParameters/i)).toBeInTheDocument();
  });

  it('should load and display seperate settings', () => {
    const availableSettings = {
      LAYOUT_REVISION: 203,
      MAIN_REVISION: 1,
      NAME: 'FW name',
      SUB_REVISION: 100,
    };

    const escs = [
      {
        index: 0,
        meta: { available: true },
        settings: { MODE: 0 },
        make: 'make 1234',
        settingsDescriptions: {
          base: [
            {
              name: 'MOTOR_DIRECTION',
              type: 'enum',
              label: 'escMotorDirection',
              options: [
                {
                  value: '1',
                  label: 'Normal',
                },
                {
                  value: '2',
                  label: 'Reversed',
                },
                {
                  value: '3',
                  label: 'Bidirectional',
                },
                {
                  value: '4',
                  label: 'Bidirectional Reversed',
                },
              ],
            },
            {
              name: '_PPM_MIN_THROTTLE',
              type: 'number',
              min: 1000,
              max: 1500,
              step: 4,
              label: 'escPPMMinThrottle',
              offset: 1000,
              factor: 4,
              suffix: ' μs',
            },
            {
              name: 'STARTUP_BEEP',
              type: 'bool',
              label: 'escStartupBeep',
            },
            {
              name: 'IVALID',
              type: 'IVALID',
              label: 'invalid',
            },
            {
              name: '_PPM_CENTER_THROTTLE',
              type: 'number',
              min: 1000,
              max: 2020,
              step: 4,
              label: 'escPPMCenterThrottle',
              offset: 1000,
              factor: 4,
              suffix: ' μs',
              visibleIf: (settings) => [3, 4].includes(settings.MOTOR_DIRECTION),
            },
          ],
        },
        individualSettings: {
          MAIN_REVISION: 0,
          SUB_REVISION: 201,
          NAME: 'Bluejay (Beta)',
        },
      },
    ];

    render(
      <Flash
        availableSettings={availableSettings}
        canFlash={false}
        disableCommon
        escCount={1}
        escs={escs}
        onCommonSettingsUpdate={onCommonSettingsUpdate}
        onFirmwareDump={onFirmwareDump}
        onFlash={onFlash}
        onIndividualSettingsUpdate={onIndividualSettingsUpdate}
        onSettingsUpdate={onSettingsUpdate}
      />
    );

    expect(screen.queryByText(/commonParameters/i)).not.toBeInTheDocument();
    expect(screen.getByText(/commonSettingsDisabledText/i)).toBeInTheDocument();
  });

  it('should displays missing ESC warning', () => {
    const availableSettings = {
      LAYOUT_REVISION: 203,
      MAIN_REVISION: 1,
      NAME: 'FW name',
      SUB_REVISION: 100,
    };

    const escs = [
      {
        index: 0,
        meta: { available: true },
        settings: { MODE: 0 },
        make: 'make 1234',
        settingsDescriptions: {
          base: [
            {
              name: 'MOTOR_DIRECTION',
              type: 'enum',
              label: 'escMotorDirection',
              options: [
                {
                  value: '1',
                  label: 'Normal',
                },
                {
                  value: '2',
                  label: 'Reversed',
                },
                {
                  value: '3',
                  label: 'Bidirectional',
                },
                {
                  value: '4',
                  label: 'Bidirectional Reversed',
                },
              ],
            },
            {
              name: '_PPM_MIN_THROTTLE',
              type: 'number',
              min: 1000,
              max: 1500,
              step: 4,
              label: 'escPPMMinThrottle',
              offset: 1000,
              factor: 4,
              suffix: ' μs',
            },
            {
              name: 'STARTUP_BEEP',
              type: 'bool',
              label: 'escStartupBeep',
            },
            {
              name: 'IVALID',
              type: 'IVALID',
              label: 'invalid',
            },
            {
              name: '_PPM_CENTER_THROTTLE',
              type: 'number',
              min: 1000,
              max: 2020,
              step: 4,
              label: 'escPPMCenterThrottle',
              offset: 1000,
              factor: 4,
              suffix: ' μs',
              visibleIf: (settings) => [3, 4].includes(settings.MOTOR_DIRECTION),
            },
          ],
        },
        individualSettings: {
          MAIN_REVISION: 0,
          SUB_REVISION: 201,
          NAME: 'Bluejay (Beta)',
        },
      },
    ];

    render(
      <Flash
        availableSettings={availableSettings}
        canFlash={false}
        escCount={4}
        escs={escs}
        onCommonSettingsUpdate={onCommonSettingsUpdate}
        onFirmwareDump={onFirmwareDump}
        onFlash={onFlash}
        onIndividualSettingsUpdate={onIndividualSettingsUpdate}
        onSettingsUpdate={onSettingsUpdate}
      />
    );

    expect(screen.getByText(/commonParameters/i)).toBeInTheDocument();
    expect(screen.getByText(/commonParameters/i)).toBeInTheDocument();
  });
});
