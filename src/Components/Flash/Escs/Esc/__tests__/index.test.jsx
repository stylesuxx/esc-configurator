import React from 'react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Esc from '../';

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

describe('Esc', () => {
  it('should display ESC details', () => {
    const esc = { individualSettings: {} };

    const onFlash = jest.fn();
    const onSettingsUpdate = jest.fn();

    render(
      <Esc
        directInput={false}
        esc={esc}
        index={0}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
      />
    );

    expect(screen.getByText(/Unsupported\/Unrecognized/i)).toBeInTheDocument();
    expect(screen.getByText(/escButtonFlash/i)).toBeInTheDocument();
    expect(screen.getByText(/ESC 1/i)).toBeInTheDocument();
  });

  it('should show name, version and boottloader', () => {
    const esc = {
      bootloaderRevision: 'bl 23',
      displayName: 'displayName 1234',
      individualSettings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 200,
        NAME: 'FW Name',
      },
    };

    const onFlash = jest.fn();
    const onSettingsUpdate = jest.fn();

    render(
      <Esc
        directInput={false}
        esc={esc}
        index={0}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
        progress={50}
      />
    );

    expect(screen.getByText(/displayName 1234/i)).toBeInTheDocument();
  });

  it('should handle empty name', () => {
    const esc = {
      bootloaderRevision: 'bl 23',
      displayName: 'displayName 1234',
      individualSettings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 200,
        NAME: '',
      },
    };

    const onFlash = jest.fn();
    const onSettingsUpdate = jest.fn();

    render(
      <Esc
        directInput={false}
        esc={esc}
        index={0}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
      />
    );

    expect(screen.getByText(/displayName 1234/i)).toBeInTheDocument();
  });

  it('should not trigger flash when disabled', () => {
    const esc = {
      bootloaderRevision: 'bl 23',
      individualSettings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 200,
        NAME: 'FW Name',
      },
    };

    const onFlash = jest.fn();
    const onSettingsUpdate = jest.fn();

    render(
      <Esc
        canFlash={false}
        directInput={false}
        esc={esc}
        index={0}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
      />
    );

    userEvent.click(screen.getByText(/escButtonFlash/i));
    expect(onFlash).not.toHaveBeenCalled();
  });

  it('should trigger flash when enabled', () => {
    const esc = {
      bootloaderRevision: 'bl 23',
      individualSettings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 200,
        NAME: 'FW Name',
      },
    };

    const onFlash = jest.fn();
    const onSettingsUpdate = jest.fn();

    render(
      <Esc
        canFlash
        directInput={false}
        esc={esc}
        index={0}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
      />
    );

    userEvent.click(screen.getByText(/escButtonFlash/i));
    expect(onFlash).toHaveBeenCalled();
  });

  it('should show custom settings and handle change', () => {
    const esc = {
      bootloaderRevision: 'bl 23',
      individualSettings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 200,
        NAME: 'FW Name',
        MOTOR_DIRECTION: 1,
        _PPM_MIN_THROTTLE: 125,
        STARTUP_BEEP: 0,
      },
      individualSettingsDescriptions: {
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
    };

    const onFlash = jest.fn();
    const onSettingsUpdate = jest.fn();

    render(
      <Esc
        canFlash
        directInput={false}
        esc={esc}
        index={0}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
      />
    );

    expect(screen.getByText(/escMotorDirection/i)).toBeInTheDocument();
    expect(screen.getByText(/escPPMMinThrottle/i)).toBeInTheDocument();
    expect(screen.getByText(/escStartupBeep/i)).toBeInTheDocument();
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();

    userEvent.click(screen.getByRole(/checkbox/i));

    // Change select
    fireEvent.change(screen.getByRole(/combobox/i), {
      taget: {
        value: 3,
        name: 'MOTOR_DIRECTION',
      },
    });
  });

  it('should show custom settings and handle direct input', () => {
    const esc = {
      bootloaderRevision: 'bl 23',
      individualSettings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 200,
        NAME: 'FW Name',
        MOTOR_DIRECTION: 1,
        _PPM_MIN_THROTTLE: 125,
        STARTUP_BEEP: 1,
      },
      individualSettingsDescriptions: {
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
    };

    const onFlash = jest.fn();
    const onSettingsUpdate = jest.fn();

    render(
      <Esc
        canFlash
        directInput
        esc={esc}
        index={0}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
      />
    );

    expect(screen.getByText(/escMotorDirection/i)).toBeInTheDocument();
    expect(screen.getByText(/escPPMMinThrottle/i)).toBeInTheDocument();
    expect(screen.getByText(/escStartupBeep/i)).toBeInTheDocument();
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();

    userEvent.click(screen.getByRole(/checkbox/i));

    fireEvent.change(screen.getByRole(/spinbutton/i), {
      target: {
        value: 1250,
        name: '_PPM_MIN_THROTTLE',
      },
    });
    fireEvent.blur(screen.getByRole(/spinbutton/i));
  });

  it('should update the progress bar', () => {
    const esc = {
      bootloaderRevision: 'bl 23',
      individualSettings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 200,
        NAME: 'FW Name',
        MOTOR_DIRECTION: 1,
        _PPM_MIN_THROTTLE: 125,
        STARTUP_BEEP: 1,
      },
      individualSettingsDescriptions: {
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
    };

    const onFlash = jest.fn();
    const onSettingsUpdate = jest.fn();

    const ref = React.createRef();

    render(
      <Esc
        canFlash
        directInput
        esc={esc}
        index={0}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
        ref={ref}
      />
    );

    ref.current.setProgress(50);
    const progressbar = screen.getByRole(/progressbar/i);
    expect(progressbar).toBeInTheDocument();
    expect(progressbar.value).toEqual(50);
  });
});
