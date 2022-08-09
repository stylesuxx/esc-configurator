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
    };

    const escs = [
      {
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
      />
    );

    expect(screen.getByText(/commonParameters/i)).toBeInTheDocument();

    expect(screen.getByText(/escMotorDirection/i)).toBeInTheDocument();
    expect(screen.getByText(/escPPMMinThrottle/i)).toBeInTheDocument();
    expect(screen.getByText(/escStartupBeep/i)).toBeInTheDocument();
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
  });

  it('should allow updating a checkbox', () => {
    const availableSettings = {
      LAYOUT_REVISION: 203,
      MAIN_REVISION: 1,
      NAME: 'FW name',
      SUB_REVISION: 100,
      STARTUP_BEEP: 0,
      MOTOR_DIRECTION: 1,
    };

    const esc = {
      meta: { available: true },
      settings: {
        MODE: 0,
        STARTUP_BEEP: 0,
      },
      make: 'make 1234',
      settingsDescriptions: {
        overrides: {
          '0.201': [
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
          ],
        },
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
      />
    );

    userEvent.click(screen.getByRole(/checkbox/i));
    expect(onSettingsUpdate).toHaveBeenCalled();
  });

  it('should allow updating a selectbox', () => {
    const availableSettings = {
      LAYOUT_REVISION: 203,
      MAIN_REVISION: 1,
      NAME: 'FW name',
      SUB_REVISION: 100,
      STARTUP_BEEP: 0,
      MOTOR_DIRECTION: 1,
    };

    const esc = {
      meta: { available: true },
      settings: {
        MODE: 0,
        STARTUP_BEEP: 0,
      },
      make: 'make 1234',
      settingsDescriptions: {
        overrides: {
          '0.201': [
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
          ],
        },
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
      />
    );

    const button = screen.getByRole('button', { name: 'escMotorDirection hints:MOTOR_DIRECTION Normal' });
    expect(button).toBeInTheDocument();
    fireEvent.mouseDown(button);

    let option = screen.getByRole('option', { name: 'Reversed' });
    userEvent.click(option);

    expect(onSettingsUpdate).toHaveBeenCalled();
  });

  it('should allow updating with direct input', () => {
    const availableSettings = {
      LAYOUT_REVISION: 203,
      MAIN_REVISION: 1,
      NAME: 'FW name',
      SUB_REVISION: 100,
    };

    const escs = [
      {
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
      />
    );

    userEvent.click(screen.getByRole(/checkbox/i));
    expect(onSettingsUpdate).toHaveBeenCalled();

    fireEvent.change(screen.getByRole(/spinbutton/i), {
      target: {
        value: 1250,
        name: '_PPM_MIN_THROTTLE',
      },
    });
    fireEvent.blur(screen.getByRole(/spinbutton/i));
  });

  it('should show an error when not all ESCs are Multi', () => {
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
      />
    );

    expect(screen.getByText(/multiOnly/i)).toBeInTheDocument();
  });

  it('should handle out of sync settings', () => {
    const availableSettings = {
      LAYOUT_REVISION: 201,
      MAIN_REVISION: 0,
      NAME: 'FW name',
      SUB_REVISION: 100,
    };

    const esc = {
      meta: { available: true },
      settings: {
        MODE: 0,
        MOTOR_DIRECTION: 0,
      },
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
      />
    );

    userEvent.click(screen.getByRole(/checkbox/i));
    expect(onSettingsUpdate).toHaveBeenCalled();
  });

  it('should handle setting overrides', () => {
    const availableSettings = {
      LAYOUT_REVISION: 201,
      MAIN_REVISION: 0,
      NAME: 'FW name',
      SUB_REVISION: 100,
      STARTUP_BEEP: 1,
      MOTOR_DIRECTION: 1,
    };

    const esc = {
      meta: { available: true },
      settings: {
        MODE: 0,
        MOTOR_DIRECTION: 0,
        STARTUP_BEEP: 1,
      },
      make: 'make 1234',
      settingsDescriptions: {
        overrides: {
          '0.100': [
            {
              name: 'MOTOR_DIRECTION',
              type: 'enum',
              label: 'escMotorDirectionOverride',
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
          ],
        },
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
      />
    );

    expect(screen.getByText(/escMotorDirectionOverride/i)).toBeInTheDocument();

    userEvent.click(screen.getByRole(/checkbox/i));
    expect(onSettingsUpdate).toHaveBeenCalled();
  });

  it('should display warning when firmware is unsopported', () => {
    const availableSettings = {
      LAYOUT_REVISION: 203,
      MAIN_REVISION: 1,
      NAME: 'JESC',
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
        unsupported
      />
    );

    expect(screen.getByText(/unsupportedFirmware/i)).toBeInTheDocument();
    expect(screen.getByText(/common:useDedicatedConfigurator/i)).toBeInTheDocument();
  });
});
