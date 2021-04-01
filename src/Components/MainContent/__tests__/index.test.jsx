import React from 'react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';

import MainContent from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

test('loads and displays MainContent', () => {
  const onWriteSetup = jest.fn();
  const onSettingsUpdate = jest.fn();
  const onSingleMotorSpeed = jest.fn();
  const onSingleFlash = jest.fn();
  const onSelectFirmwareForAll = jest.fn();
  const onSaveLog = jest.fn();
  const onResetDefaultls = jest.fn();
  const onReadEscs = jest.fn();
  const onLocalSubmit = jest.fn();
  const onIndividualSettingsUpdate = jest.fn();
  const onFlashUrl = jest.fn();
  const onCancelFirmwareSelection = jest.fn();
  const onAllMotorSpeed = jest.fn();

  const actions = {
    isReading: false,
    isWriting: false,
    isSelecting: false,
    isFlashing: false,
  };

  const configs = {
    versions: {},
    escs: {},
    pwm: {},
    platforms: {},
  };

  render(
    <MainContent
      actions={actions}
      configs={configs}
      onAllMotorSpeed={onAllMotorSpeed}
      onCancelFirmwareSelection={onCancelFirmwareSelection}
      onFlashUrl={onFlashUrl}
      onIndividualSettingsUpdate={onIndividualSettingsUpdate}
      onLocalSubmit={onLocalSubmit}
      onReadEscs={onReadEscs}
      onResetDefaultls={onResetDefaultls}
      onSaveLog={onSaveLog}
      onSelectFirmwareForAll={onSelectFirmwareForAll}
      onSettingsUpdate={onSettingsUpdate}
      onSingleFlash={onSingleFlash}
      onSingleMotorSpeed={onSingleMotorSpeed}
      onWriteSetup={onWriteSetup}
    />
  );

  expect(screen.getByText(/homeWelcome/i)).toBeInTheDocument();
  expect(screen.getByText(/betaWarning/i)).toBeInTheDocument();
  expect(screen.getByText(/homeDisclaimerHeader/i)).toBeInTheDocument();
  expect(screen.getByText(/homeDisclaimerText/i)).toBeInTheDocument();
  expect(screen.getByText(/homeAttributionHeader/i)).toBeInTheDocument();
  expect(screen.getByText(/homeAttributionText/i)).toBeInTheDocument();
  expect(screen.getByText(/homeExperimental/i)).toBeInTheDocument();
  expect(screen.getByText(/homeVersionInfo/i)).toBeInTheDocument();
  expect(screen.getByText(/blhelisText/i)).toBeInTheDocument();
  expect(screen.getByText(/bluejayText/i)).toBeInTheDocument();
  expect(screen.getByText(/blheli32ToAM32/i)).toBeInTheDocument();
  expect(screen.getByText(/homeDiscordHeader/i)).toBeInTheDocument();
  expect(screen.getByText(/homeDiscordText/i)).toBeInTheDocument();
  expect(screen.getByText(/homeChinaHeader/i)).toBeInTheDocument();
  expect(screen.getByText(/homeChinaText/i)).toBeInTheDocument();
  expect(screen.getByText(/homeContributionHeader/i)).toBeInTheDocument();
  expect(screen.getByText(/homeContributionText/i)).toBeInTheDocument();
  expect(screen.getByText(/homeContributionHeader/i)).toBeInTheDocument();
  expect(screen.getByText(/whatsNextHeader/i)).toBeInTheDocument();
  expect(screen.getByText(/whatsNextText/i)).toBeInTheDocument();
  expect(screen.getByText(/defaultChangelogTitle/i)).toBeInTheDocument();
  expect(screen.getByText(/defaultChangelogHead/i)).toBeInTheDocument();
});

test('open', () => {
  const onWriteSetup = jest.fn();
  const onSettingsUpdate = jest.fn();
  const onSingleMotorSpeed = jest.fn();
  const onSingleFlash = jest.fn();
  const onSelectFirmwareForAll = jest.fn();
  const onSaveLog = jest.fn();
  const onResetDefaultls = jest.fn();
  const onReadEscs = jest.fn();
  const onLocalSubmit = jest.fn();
  const onIndividualSettingsUpdate = jest.fn();
  const onFlashUrl = jest.fn();
  const onCancelFirmwareSelection = jest.fn();
  const onAllMotorSpeed = jest.fn();

  const actions = {
    isReading: false,
    isWriting: false,
    isSelecting: false,
    isFlashing: false,
  };

  const configs = {
    versions: {},
    escs: {},
    pwm: {},
    platforms: {},
  };

  render(
    <MainContent
      actions={actions}
      configs={configs}
      onAllMotorSpeed={onAllMotorSpeed}
      onCancelFirmwareSelection={onCancelFirmwareSelection}
      onFlashUrl={onFlashUrl}
      onIndividualSettingsUpdate={onIndividualSettingsUpdate}
      onLocalSubmit={onLocalSubmit}
      onReadEscs={onReadEscs}
      onResetDefaultls={onResetDefaultls}
      onSaveLog={onSaveLog}
      onSelectFirmwareForAll={onSelectFirmwareForAll}
      onSettingsUpdate={onSettingsUpdate}
      onSingleFlash={onSingleFlash}
      onSingleMotorSpeed={onSingleMotorSpeed}
      onWriteSetup={onWriteSetup}
      open
    />
  );

  expect(screen.getByText(/notePropsOff/i)).toBeInTheDocument();
  expect(screen.getByText(/noteConnectPower/i)).toBeInTheDocument();
  expect(screen.getByText('motorControl')).toBeInTheDocument();
  expect(screen.getByText(/enableMotorControl/i)).toBeInTheDocument();
  expect(screen.getByText(/masterSpeed/i)).toBeInTheDocument();
  expect(screen.getByText("escButtonSaveLog")).toBeInTheDocument();
  expect(screen.getByText(/escButtonFlashAll/i)).toBeInTheDocument();
});

test('isSelecting', () => {
  const onWriteSetup = jest.fn();
  const onSettingsUpdate = jest.fn();
  const onSingleMotorSpeed = jest.fn();
  const onSingleFlash = jest.fn();
  const onSelectFirmwareForAll = jest.fn();
  const onSaveLog = jest.fn();
  const onResetDefaultls = jest.fn();
  const onReadEscs = jest.fn();
  const onLocalSubmit = jest.fn();
  const onIndividualSettingsUpdate = jest.fn();
  const onFlashUrl = jest.fn();
  const onCancelFirmwareSelection = jest.fn();
  const onAllMotorSpeed = jest.fn();

  const actions = {
    isReading: false,
    isWriting: false,
    isSelecting: true,
    isFlashing: false,
  };

  const configs = {
    versions: {},
    escs: {},
    pwm: {},
    platforms: {},
  };

  render(
    <MainContent
      actions={actions}
      configs={configs}
      onAllMotorSpeed={onAllMotorSpeed}
      onCancelFirmwareSelection={onCancelFirmwareSelection}
      onFlashUrl={onFlashUrl}
      onIndividualSettingsUpdate={onIndividualSettingsUpdate}
      onLocalSubmit={onLocalSubmit}
      onReadEscs={onReadEscs}
      onResetDefaultls={onResetDefaultls}
      onSaveLog={onSaveLog}
      onSelectFirmwareForAll={onSelectFirmwareForAll}
      onSettingsUpdate={onSettingsUpdate}
      onSingleFlash={onSingleFlash}
      onSingleMotorSpeed={onSingleMotorSpeed}
      onWriteSetup={onWriteSetup}
      open
    />
  );

  expect(screen.getByText(/forceFlashText/i)).toBeInTheDocument();
  expect(screen.getByText(/forceFlashHint/i)).toBeInTheDocument();
  expect(screen.getByText(/migrateFlashText/i)).toBeInTheDocument();
  expect(screen.getByText(/migrateFlashHint/i)).toBeInTheDocument();
  expect(screen.getByText(/forceFlashText/i)).toBeInTheDocument();

  expect(screen.getByText("escButtonSelect")).toBeInTheDocument();
  expect(screen.getByText(/escButtonSelectLocally/i)).toBeInTheDocument();
  expect(screen.getByText(/buttonCancel/i)).toBeInTheDocument();

  expect(screen.getByText(/selectFirmware/i)).toBeInTheDocument();
  expect(screen.getByText(/selectTarget/i)).toBeInTheDocument();
});

test('isFlashing', () => {
  const onWriteSetup = jest.fn();
  const onSettingsUpdate = jest.fn();
  const onSingleMotorSpeed = jest.fn();
  const onSingleFlash = jest.fn();
  const onSelectFirmwareForAll = jest.fn();
  const onSaveLog = jest.fn();
  const onResetDefaultls = jest.fn();
  const onReadEscs = jest.fn();
  const onLocalSubmit = jest.fn();
  const onIndividualSettingsUpdate = jest.fn();
  const onFlashUrl = jest.fn();
  const onCancelFirmwareSelection = jest.fn();
  const onAllMotorSpeed = jest.fn();

  const actions = {
    isReading: false,
    isWriting: false,
    isSelecting: false,
    isFlashing: true,
  };

  const configs = {
    versions: {},
    escs: {},
    pwm: {},
    platforms: {},
  };

  render(
    <MainContent
      actions={actions}
      configs={configs}
      onAllMotorSpeed={onAllMotorSpeed}
      onCancelFirmwareSelection={onCancelFirmwareSelection}
      onFlashUrl={onFlashUrl}
      onIndividualSettingsUpdate={onIndividualSettingsUpdate}
      onLocalSubmit={onLocalSubmit}
      onReadEscs={onReadEscs}
      onResetDefaultls={onResetDefaultls}
      onSaveLog={onSaveLog}
      onSelectFirmwareForAll={onSelectFirmwareForAll}
      onSettingsUpdate={onSettingsUpdate}
      onSingleFlash={onSingleFlash}
      onSingleMotorSpeed={onSingleMotorSpeed}
      onWriteSetup={onWriteSetup}
      open
    />
  );

  expect(screen.getByText(/notePropsOff/i)).toBeInTheDocument();
  expect(screen.getByText(/noteConnectPower/i)).toBeInTheDocument();
  expect(screen.getByText('motorControl')).toBeInTheDocument();
  expect(screen.getByText(/enableMotorControl/i)).toBeInTheDocument();
  expect(screen.getByText(/masterSpeed/i)).toBeInTheDocument();
  expect(screen.getByText("escButtonSaveLog")).toBeInTheDocument();
  expect(screen.getByText(/escButtonFlashAll/i)).toBeInTheDocument();
});

test('isWriting', () => {
  const onWriteSetup = jest.fn();
  const onSettingsUpdate = jest.fn();
  const onSingleMotorSpeed = jest.fn();
  const onSingleFlash = jest.fn();
  const onSelectFirmwareForAll = jest.fn();
  const onSaveLog = jest.fn();
  const onResetDefaultls = jest.fn();
  const onReadEscs = jest.fn();
  const onLocalSubmit = jest.fn();
  const onIndividualSettingsUpdate = jest.fn();
  const onFlashUrl = jest.fn();
  const onCancelFirmwareSelection = jest.fn();
  const onAllMotorSpeed = jest.fn();

  const actions = {
    isReading: false,
    isWriting: true,
    isSelecting: false,
    isFlashing: false,
  };

  const configs = {
    versions: {},
    escs: {},
    pwm: {},
    platforms: {},
  };

  render(
    <MainContent
      actions={actions}
      configs={configs}
      onAllMotorSpeed={onAllMotorSpeed}
      onCancelFirmwareSelection={onCancelFirmwareSelection}
      onFlashUrl={onFlashUrl}
      onIndividualSettingsUpdate={onIndividualSettingsUpdate}
      onLocalSubmit={onLocalSubmit}
      onReadEscs={onReadEscs}
      onResetDefaultls={onResetDefaultls}
      onSaveLog={onSaveLog}
      onSelectFirmwareForAll={onSelectFirmwareForAll}
      onSettingsUpdate={onSettingsUpdate}
      onSingleFlash={onSingleFlash}
      onSingleMotorSpeed={onSingleMotorSpeed}
      onWriteSetup={onWriteSetup}
      open
    />
  );

  expect(screen.getByText(/notePropsOff/i)).toBeInTheDocument();
  expect(screen.getByText(/noteConnectPower/i)).toBeInTheDocument();
  expect(screen.getByText('motorControl')).toBeInTheDocument();
  expect(screen.getByText(/enableMotorControl/i)).toBeInTheDocument();
  expect(screen.getByText(/masterSpeed/i)).toBeInTheDocument();
  expect(screen.getByText("escButtonSaveLog")).toBeInTheDocument();
  expect(screen.getByText(/escButtonFlashAll/i)).toBeInTheDocument();
});

test('isReading', () => {
  const onWriteSetup = jest.fn();
  const onSettingsUpdate = jest.fn();
  const onSingleMotorSpeed = jest.fn();
  const onSingleFlash = jest.fn();
  const onSelectFirmwareForAll = jest.fn();
  const onSaveLog = jest.fn();
  const onResetDefaultls = jest.fn();
  const onReadEscs = jest.fn();
  const onLocalSubmit = jest.fn();
  const onIndividualSettingsUpdate = jest.fn();
  const onFlashUrl = jest.fn();
  const onCancelFirmwareSelection = jest.fn();
  const onAllMotorSpeed = jest.fn();

  const actions = {
    isReading: true,
    isWriting: false,
    isSelecting: false,
    isFlashing: false,
  };

  const configs = {
    versions: {},
    escs: {},
    pwm: {},
    platforms: {},
  };

  render(
    <MainContent
      actions={actions}
      configs={configs}
      onAllMotorSpeed={onAllMotorSpeed}
      onCancelFirmwareSelection={onCancelFirmwareSelection}
      onFlashUrl={onFlashUrl}
      onIndividualSettingsUpdate={onIndividualSettingsUpdate}
      onLocalSubmit={onLocalSubmit}
      onReadEscs={onReadEscs}
      onResetDefaultls={onResetDefaultls}
      onSaveLog={onSaveLog}
      onSelectFirmwareForAll={onSelectFirmwareForAll}
      onSettingsUpdate={onSettingsUpdate}
      onSingleFlash={onSingleFlash}
      onSingleMotorSpeed={onSingleMotorSpeed}
      onWriteSetup={onWriteSetup}
      open
    />
  );

  expect(screen.getByText(/notePropsOff/i)).toBeInTheDocument();
  expect(screen.getByText(/noteConnectPower/i)).toBeInTheDocument();
  expect(screen.getByText("escButtonSaveLog")).toBeInTheDocument();
  expect(screen.getByText(/escButtonFlashAll/i)).toBeInTheDocument();
});

test('isReading with ESC', () => {
  const onWriteSetup = jest.fn();
  const onSettingsUpdate = jest.fn();
  const onSingleMotorSpeed = jest.fn();
  const onSingleFlash = jest.fn();
  const onSelectFirmwareForAll = jest.fn();
  const onSaveLog = jest.fn();
  const onResetDefaultls = jest.fn();
  const onReadEscs = jest.fn();
  const onLocalSubmit = jest.fn();
  const onIndividualSettingsUpdate = jest.fn();
  const onFlashUrl = jest.fn();
  const onCancelFirmwareSelection = jest.fn();
  const onAllMotorSpeed = jest.fn();

  const actions = {
    isReading: true,
    isWriting: false,
    isSelecting: false,
    isFlashing: false,
  };

  const configs = {
    versions: {},
    escs: {},
    pwm: {},
    platforms: {},
  };

  const escs = [
    {
      index: 0,
      meta: { available: true },
      settings: {
        MODE: 0,
        STARTUP_BEEP: 0,
      },
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
                value: '1', label: 'Normal',
              },
              {
                value: '2', label: 'Reversed',
              },
              {
                value: '3', label: 'Bidirectional',
              },
              {
                value: '4', label: 'Bidirectional Reversed',
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
    },
  ];

  render(
    <MainContent
      actions={actions}
      configs={configs}
      escs={escs}
      onAllMotorSpeed={onAllMotorSpeed}
      onCancelFirmwareSelection={onCancelFirmwareSelection}
      onFlashUrl={onFlashUrl}
      onIndividualSettingsUpdate={onIndividualSettingsUpdate}
      onLocalSubmit={onLocalSubmit}
      onReadEscs={onReadEscs}
      onResetDefaultls={onResetDefaultls}
      onSaveLog={onSaveLog}
      onSelectFirmwareForAll={onSelectFirmwareForAll}
      onSettingsUpdate={onSettingsUpdate}
      onSingleFlash={onSingleFlash}
      onSingleMotorSpeed={onSingleMotorSpeed}
      onWriteSetup={onWriteSetup}
      open
    />
  );

  expect(screen.getByText(/notePropsOff/i)).toBeInTheDocument();
  expect(screen.getByText(/noteConnectPower/i)).toBeInTheDocument();
  expect(screen.getByText("escButtonSaveLog")).toBeInTheDocument();
  expect(screen.getByText(/escButtonFlashAll/i)).toBeInTheDocument();
});

test('isWriting with ESC', () => {
  const onWriteSetup = jest.fn();
  const onSettingsUpdate = jest.fn();
  const onSingleMotorSpeed = jest.fn();
  const onSingleFlash = jest.fn();
  const onSelectFirmwareForAll = jest.fn();
  const onSaveLog = jest.fn();
  const onResetDefaultls = jest.fn();
  const onReadEscs = jest.fn();
  const onLocalSubmit = jest.fn();
  const onIndividualSettingsUpdate = jest.fn();
  const onFlashUrl = jest.fn();
  const onCancelFirmwareSelection = jest.fn();
  const onAllMotorSpeed = jest.fn();

  const actions = {
    isReading: false,
    isWriting: true,
    isSelecting: false,
    isFlashing: false,
  };

  const configs = {
    versions: {},
    escs: {},
    pwm: {},
    platforms: {},
  };

  const escs = [
    {
      index: 0,
      meta: { available: true },
      settings: {
        MODE: 0,
        STARTUP_BEEP: 0,
      },
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
                value: '1', label: 'Normal',
              },
              {
                value: '2', label: 'Reversed',
              },
              {
                value: '3', label: 'Bidirectional',
              },
              {
                value: '4', label: 'Bidirectional Reversed',
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
    },
  ];

  render(
    <MainContent
      actions={actions}
      configs={configs}
      escs={escs}
      onAllMotorSpeed={onAllMotorSpeed}
      onCancelFirmwareSelection={onCancelFirmwareSelection}
      onFlashUrl={onFlashUrl}
      onIndividualSettingsUpdate={onIndividualSettingsUpdate}
      onLocalSubmit={onLocalSubmit}
      onReadEscs={onReadEscs}
      onResetDefaultls={onResetDefaultls}
      onSaveLog={onSaveLog}
      onSelectFirmwareForAll={onSelectFirmwareForAll}
      onSettingsUpdate={onSettingsUpdate}
      onSingleFlash={onSingleFlash}
      onSingleMotorSpeed={onSingleMotorSpeed}
      onWriteSetup={onWriteSetup}
      open
    />
  );

  expect(screen.getByText(/notePropsOff/i)).toBeInTheDocument();
  expect(screen.getByText(/noteConnectPower/i)).toBeInTheDocument();
  expect(screen.getByText("escButtonSaveLog")).toBeInTheDocument();
  expect(screen.getByText(/escButtonFlashAll/i)).toBeInTheDocument();
});

test('isSelecting with ESC', () => {
  const onWriteSetup = jest.fn();
  const onSettingsUpdate = jest.fn();
  const onSingleMotorSpeed = jest.fn();
  const onSingleFlash = jest.fn();
  const onSelectFirmwareForAll = jest.fn();
  const onSaveLog = jest.fn();
  const onResetDefaultls = jest.fn();
  const onReadEscs = jest.fn();
  const onLocalSubmit = jest.fn();
  const onIndividualSettingsUpdate = jest.fn();
  const onFlashUrl = jest.fn();
  const onCancelFirmwareSelection = jest.fn();
  const onAllMotorSpeed = jest.fn();

  const actions = {
    isReading: false,
    isWriting: false,
    isSelecting: true,
    isFlashing: false,
  };

  const configs = {
    versions: {},
    escs: {},
    pwm: {},
    platforms: {},
  };

  const escs = [
    {
      index: 0,
      meta: { available: true },
      settings: {
        MODE: 0,
        STARTUP_BEEP: 0,
      },
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
                value: '1', label: 'Normal',
              },
              {
                value: '2', label: 'Reversed',
              },
              {
                value: '3', label: 'Bidirectional',
              },
              {
                value: '4', label: 'Bidirectional Reversed',
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
    },
  ];

  render(
    <MainContent
      actions={actions}
      configs={configs}
      escs={escs}
      flashTargets={[0]}
      onAllMotorSpeed={onAllMotorSpeed}
      onCancelFirmwareSelection={onCancelFirmwareSelection}
      onFlashUrl={onFlashUrl}
      onIndividualSettingsUpdate={onIndividualSettingsUpdate}
      onLocalSubmit={onLocalSubmit}
      onReadEscs={onReadEscs}
      onResetDefaultls={onResetDefaultls}
      onSaveLog={onSaveLog}
      onSelectFirmwareForAll={onSelectFirmwareForAll}
      onSettingsUpdate={onSettingsUpdate}
      onSingleFlash={onSingleFlash}
      onSingleMotorSpeed={onSingleMotorSpeed}
      onWriteSetup={onWriteSetup}
      open
    />
  );

  expect(screen.getByText(/forceFlashText/i)).toBeInTheDocument();
  expect(screen.getByText(/forceFlashHint/i)).toBeInTheDocument();
  expect(screen.getByText(/migrateFlashText/i)).toBeInTheDocument();
  expect(screen.getByText(/migrateFlashHint/i)).toBeInTheDocument();
  expect(screen.getByText(/forceFlashText/i)).toBeInTheDocument();
});
