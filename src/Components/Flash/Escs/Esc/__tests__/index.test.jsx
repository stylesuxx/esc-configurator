import React from 'react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Esc from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

test('loads and displays Esc', () => {
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

test('displays name, version and bootloader', () => {
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

test('handles empty name', () => {
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

test('does not trigger onFlash when disabled', () => {
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

test('does trigger onFlash when enabled', () => {
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

test('shows and handles settings when available', () => {
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

test('shows and handles settings with direct input', () => {
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
