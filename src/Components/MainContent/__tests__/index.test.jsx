import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import configsReducer from '../../../Containers/App/configsSlice';
import melodiesReducer from '../../MelodyEditor/melodiesSlice';
import settingsReducer from '../../AppSettings/settingsSlice';
import stateReducer, {
  setSelecting,
  setWriting,
} from '../../../Containers/App/stateSlice';
import logReducer from '../../Log/logSlice';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

let onWriteSetup;
let onSettingsUpdate;
let onSingleMotorSpeed;
let onSingleFlash;
let onSelectFirmwareForAll;
let onResetDefaultls;
let onReadEscs;
let onLocalSubmit;
let onIndividualSettingsUpdate;
let onFlashUrl;
let onCancelFirmwareSelection;
let onAllMotorSpeed;
let onOpenMelodyEditor;
let MainContent;

function setupTestStore() {
  const refObj = {};

  beforeEach(() => {
    const store = configureStore({
      reducer: {
        configs: configsReducer,
        log: logReducer,
        melodies: melodiesReducer,
        settings: settingsReducer,
        state: stateReducer,
      },
    });
    refObj.store = store;
    refObj.wrapper = ({ children }) => (
      <Provider store={store}>
        {children}
      </Provider>
    );
  });

  return refObj;
}

describe('MainContent', () => {
  const storeRef = setupTestStore();

  beforeAll(async () => {
    /**
     * require component instead of import so that we can properly
     * pre-populate the local storage
     */
    MainContent = require('../').default;
  });

  beforeEach(() => {
    onWriteSetup = jest.fn();
    onSettingsUpdate = jest.fn();
    onSingleMotorSpeed = jest.fn();
    onSingleFlash = jest.fn();
    onSelectFirmwareForAll = jest.fn();
    onResetDefaultls = jest.fn();
    onReadEscs = jest.fn();
    onLocalSubmit = jest.fn();
    onIndividualSettingsUpdate = jest.fn();
    onFlashUrl = jest.fn();
    onCancelFirmwareSelection = jest.fn();
    onAllMotorSpeed = jest.fn();
    onOpenMelodyEditor = jest.fn();
  });

  it('should display main content', () => {
    render(
      <MainContent
        onAllMotorSpeed={onAllMotorSpeed}
        onCancelFirmwareSelection={onCancelFirmwareSelection}
        onFlashUrl={onFlashUrl}
        onIndividualSettingsUpdate={onIndividualSettingsUpdate}
        onLocalSubmit={onLocalSubmit}
        onOpenMelodyEditor={onOpenMelodyEditor}
        onReadEscs={onReadEscs}
        onResetDefaultls={onResetDefaultls}
        onSelectFirmwareForAll={onSelectFirmwareForAll}
        onSettingsUpdate={onSettingsUpdate}
        onSingleFlash={onSingleFlash}
        onSingleMotorSpeed={onSingleMotorSpeed}
        onWriteSetup={onWriteSetup}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/homeWelcome/i)).toBeInTheDocument();
    expect(screen.getByText(/betaWarningLine1/i)).toBeInTheDocument();
    expect(screen.getByText(/betaWarningLine2/i)).toBeInTheDocument();
    expect(screen.getByText(/homeDisclaimerHeader/i)).toBeInTheDocument();
    expect(screen.getByText(/homeDisclaimerTextLine1/i)).toBeInTheDocument();
    expect(screen.getByText(/homeDisclaimerTextLine2/i)).toBeInTheDocument();
    expect(screen.getByText(/homeAttributionHeader/i)).toBeInTheDocument();
    expect(screen.getByText(/homeAttributionText/i)).toBeInTheDocument();
    expect(screen.getByText(/homeExperimental/i)).toBeInTheDocument();
    expect(screen.getByText(/homeVersionInfo/i)).toBeInTheDocument();
    expect(screen.getByText(/blhelisTextLine1/i)).toBeInTheDocument();
    expect(screen.getByText(/blhelisTextLine2/i)).toBeInTheDocument();
    expect(screen.getByText(/bluejayTextLine1/i)).toBeInTheDocument();
    expect(screen.getByText(/bluejayTextLine2/i)).toBeInTheDocument();
    expect(screen.getByText(/blheli32ToAM32Line1/i)).toBeInTheDocument();
    expect(screen.getByText(/blheli32ToAM32Line2/i)).toBeInTheDocument();
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

  it('should display with open port', () => {
    const onWriteSetup = jest.fn();
    const onSettingsUpdate = jest.fn();
    const onSingleMotorSpeed = jest.fn();
    const onSingleFlash = jest.fn();
    const onSelectFirmwareForAll = jest.fn();
    const onResetDefaultls = jest.fn();
    const onReadEscs = jest.fn();
    const onLocalSubmit = jest.fn();
    const onIndividualSettingsUpdate = jest.fn();
    const onFlashUrl = jest.fn();
    const onCancelFirmwareSelection = jest.fn();
    const onAllMotorSpeed = jest.fn();
    const onOpenMelodyEditor = jest.fn();

    render(
      <MainContent
        onAllMotorSpeed={onAllMotorSpeed}
        onCancelFirmwareSelection={onCancelFirmwareSelection}
        onFlashUrl={onFlashUrl}
        onIndividualSettingsUpdate={onIndividualSettingsUpdate}
        onLocalSubmit={onLocalSubmit}
        onOpenMelodyEditor={onOpenMelodyEditor}
        onReadEscs={onReadEscs}
        onResetDefaultls={onResetDefaultls}
        onSelectFirmwareForAll={onSelectFirmwareForAll}
        onSettingsUpdate={onSettingsUpdate}
        onSingleFlash={onSingleFlash}
        onSingleMotorSpeed={onSingleMotorSpeed}
        onWriteSetup={onWriteSetup}
        open
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/notePropsOff/i)).toBeInTheDocument();
    expect(screen.getByText(/noteConnectPower/i)).toBeInTheDocument();
    expect(screen.getByText('motorControl')).toBeInTheDocument();
    expect(screen.getByText(/enableMotorControl/i)).toBeInTheDocument();
    expect(screen.getByText(/masterSpeed/i)).toBeInTheDocument();
    expect(screen.getByText("escButtonSaveLog")).toBeInTheDocument();
    expect(screen.getByText("escButtonClearLog")).toBeInTheDocument();
    expect(screen.getByText(/escButtonFlashAll/i)).toBeInTheDocument();
  });

  it('should display when selecting', () => {
    storeRef.store.dispatch(setSelecting(true));

    render(
      <MainContent
        onAllMotorSpeed={onAllMotorSpeed}
        onCancelFirmwareSelection={onCancelFirmwareSelection}
        onFlashUrl={onFlashUrl}
        onIndividualSettingsUpdate={onIndividualSettingsUpdate}
        onLocalSubmit={onLocalSubmit}
        onOpenMelodyEditor={onOpenMelodyEditor}
        onReadEscs={onReadEscs}
        onResetDefaultls={onResetDefaultls}
        onSelectFirmwareForAll={onSelectFirmwareForAll}
        onSettingsUpdate={onSettingsUpdate}
        onSingleFlash={onSingleFlash}
        onSingleMotorSpeed={onSingleMotorSpeed}
        onWriteSetup={onWriteSetup}
        open
      />,
      { wrapper: storeRef.wrapper }
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

  it('should display when flashing', () => {
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
        onOpenMelodyEditor={onOpenMelodyEditor}
        onReadEscs={onReadEscs}
        onResetDefaultls={onResetDefaultls}
        onSelectFirmwareForAll={onSelectFirmwareForAll}
        onSettingsUpdate={onSettingsUpdate}
        onSingleFlash={onSingleFlash}
        onSingleMotorSpeed={onSingleMotorSpeed}
        onWriteSetup={onWriteSetup}
        open
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/notePropsOff/i)).toBeInTheDocument();
    expect(screen.getByText(/noteConnectPower/i)).toBeInTheDocument();
    expect(screen.getByText('motorControl')).toBeInTheDocument();
    expect(screen.getByText(/enableMotorControl/i)).toBeInTheDocument();
    expect(screen.getByText(/masterSpeed/i)).toBeInTheDocument();
    expect(screen.getByText("escButtonSaveLog")).toBeInTheDocument();
    expect(screen.getByText("escButtonClearLog")).toBeInTheDocument();
    expect(screen.getByText(/escButtonFlashAll/i)).toBeInTheDocument();
  });

  it('should display when writing', () => {
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
    };

    const mspFeatures = { '3D': true };

    render(
      <MainContent
        actions={actions}
        configs={configs}
        mspFeatures={mspFeatures}
        onAllMotorSpeed={onAllMotorSpeed}
        onCancelFirmwareSelection={onCancelFirmwareSelection}
        onFlashUrl={onFlashUrl}
        onIndividualSettingsUpdate={onIndividualSettingsUpdate}
        onLocalSubmit={onLocalSubmit}
        onOpenMelodyEditor={onOpenMelodyEditor}
        onReadEscs={onReadEscs}
        onResetDefaultls={onResetDefaultls}
        onSelectFirmwareForAll={onSelectFirmwareForAll}
        onSettingsUpdate={onSettingsUpdate}
        onSingleFlash={onSingleFlash}
        onSingleMotorSpeed={onSingleMotorSpeed}
        onWriteSetup={onWriteSetup}
        open
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/notePropsOff/i)).toBeInTheDocument();
    expect(screen.getByText(/noteConnectPower/i)).toBeInTheDocument();
    expect(screen.getByText('motorControl')).toBeInTheDocument();
    expect(screen.getByText(/enableMotorControl/i)).toBeInTheDocument();
    expect(screen.getByText(/masterSpeed/i)).toBeInTheDocument();
    expect(screen.getByText("escButtonSaveLog")).toBeInTheDocument();
    expect(screen.getByText("escButtonClearLog")).toBeInTheDocument();
    expect(screen.getByText(/escButtonFlashAll/i)).toBeInTheDocument();
  });

  it('should display when reading', () => {
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
        onOpenMelodyEditor={onOpenMelodyEditor}
        onReadEscs={onReadEscs}
        onResetDefaultls={onResetDefaultls}
        onSelectFirmwareForAll={onSelectFirmwareForAll}
        onSettingsUpdate={onSettingsUpdate}
        onSingleFlash={onSingleFlash}
        onSingleMotorSpeed={onSingleMotorSpeed}
        onWriteSetup={onWriteSetup}
        open
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/notePropsOff/i)).toBeInTheDocument();
    expect(screen.getByText(/noteConnectPower/i)).toBeInTheDocument();
    expect(screen.getByText("escButtonSaveLog")).toBeInTheDocument();
    expect(screen.getByText("escButtonClearLog")).toBeInTheDocument();
    expect(screen.getByText(/escButtonFlashAll/i)).toBeInTheDocument();
  });

  it('should display when reading with ESC', () => {
    const actions = {
      isReading: true,
      isWriting: false,
      isSelecting: false,
      isFlashing: false,
    };

    const settings = {
      LAYOUT_REVISION: 0,
      MAIN_REVISION: 1,
      SUB_REVISION: 2,
      NAME: 'NAME',
    };

    const configs = {
      versions: {},
      escs: {},
      pwm: {},
    };

    const escs = [
      {
        index: 0,
        meta: { available: true },
        settings: {
          LAYOUT_REVISION: 0,
          MODE: 0,
          STARTUP_BEEP: 0,
        },
        bootloaderRevision: 'bl 23',
        individualSettings: {
          LAYOUT_REVISION: 0,
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
        onOpenMelodyEditor={onOpenMelodyEditor}
        onReadEscs={onReadEscs}
        onResetDefaultls={onResetDefaultls}
        onSelectFirmwareForAll={onSelectFirmwareForAll}
        onSettingsUpdate={onSettingsUpdate}
        onSingleFlash={onSingleFlash}
        onSingleMotorSpeed={onSingleMotorSpeed}
        onWriteSetup={onWriteSetup}
        open
        settings={settings}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/notePropsOff/i)).toBeInTheDocument();
    expect(screen.getByText(/noteConnectPower/i)).toBeInTheDocument();
    expect(screen.getByText("escButtonSaveLog")).toBeInTheDocument();
    expect(screen.getByText("escButtonClearLog")).toBeInTheDocument();
    expect(screen.getByText(/escButtonFlashAll/i)).toBeInTheDocument();
  });

  it('should display when writing with ESC', () => {
    storeRef.store.dispatch(setWriting(true));

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
      },
    ];

    const settings = {
      LAYOUT_REVISION: 0,
      MAIN_REVISION: 1,
      SUB_REVISION: 2,
      NAME: 'NAME',
    };

    render(
      <MainContent
        escs={escs}
        onAllMotorSpeed={onAllMotorSpeed}
        onCancelFirmwareSelection={onCancelFirmwareSelection}
        onFlashUrl={onFlashUrl}
        onIndividualSettingsUpdate={onIndividualSettingsUpdate}
        onLocalSubmit={onLocalSubmit}
        onOpenMelodyEditor={onOpenMelodyEditor}
        onReadEscs={onReadEscs}
        onResetDefaultls={onResetDefaultls}
        onSelectFirmwareForAll={onSelectFirmwareForAll}
        onSettingsUpdate={onSettingsUpdate}
        onSingleFlash={onSingleFlash}
        onSingleMotorSpeed={onSingleMotorSpeed}
        onWriteSetup={onWriteSetup}
        open
        settings={settings}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/notePropsOff/i)).toBeInTheDocument();
    expect(screen.getByText(/noteConnectPower/i)).toBeInTheDocument();
    expect(screen.getByText("escButtonSaveLog")).toBeInTheDocument();
    expect(screen.getByText("escButtonClearLog")).toBeInTheDocument();
    expect(screen.getByText(/escButtonFlashAll/i)).toBeInTheDocument();
  });

  it('should display when selecting with ESC', () => {
    storeRef.store.dispatch(setSelecting(true));

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
          STARTUP_MELODY: [],
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
      },
    ];

    render(
      <MainContent
        escs={escs}
        flashTargets={[0]}
        onAllMotorSpeed={onAllMotorSpeed}
        onCancelFirmwareSelection={onCancelFirmwareSelection}
        onFlashUrl={onFlashUrl}
        onIndividualSettingsUpdate={onIndividualSettingsUpdate}
        onLocalSubmit={onLocalSubmit}
        onOpenMelodyEditor={onOpenMelodyEditor}
        onReadEscs={onReadEscs}
        onResetDefaultls={onResetDefaultls}
        onSelectFirmwareForAll={onSelectFirmwareForAll}
        onSettingsUpdate={onSettingsUpdate}
        onSingleFlash={onSingleFlash}
        onSingleMotorSpeed={onSingleMotorSpeed}
        onWriteSetup={onWriteSetup}
        open
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/forceFlashText/i)).toBeInTheDocument();
    expect(screen.getByText(/forceFlashHint/i)).toBeInTheDocument();
    expect(screen.getByText(/migrateFlashText/i)).toBeInTheDocument();
    expect(screen.getByText(/migrateFlashHint/i)).toBeInTheDocument();
    expect(screen.getByText(/forceFlashText/i)).toBeInTheDocument();
  });

  it('should display with fourWay active', () => {
    render(
      <MainContent
        fourWay
        onAllMotorSpeed={onAllMotorSpeed}
        onCancelFirmwareSelection={onCancelFirmwareSelection}
        onFlashUrl={onFlashUrl}
        onIndividualSettingsUpdate={onIndividualSettingsUpdate}
        onLocalSubmit={onLocalSubmit}
        onOpenMelodyEditor={onOpenMelodyEditor}
        onReadEscs={onReadEscs}
        onResetDefaultls={onResetDefaultls}
        onSelectFirmwareForAll={onSelectFirmwareForAll}
        onSettingsUpdate={onSettingsUpdate}
        onSingleFlash={onSingleFlash}
        onSingleMotorSpeed={onSingleMotorSpeed}
        onWriteSetup={onWriteSetup}
        open
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/notePropsOff/i)).toBeInTheDocument();
    expect(screen.getByText(/noteConnectPower/i)).toBeInTheDocument();
    expect(screen.queryByText('motorControl')).not.toBeInTheDocument();
    expect(screen.getByText("escButtonSaveLog")).toBeInTheDocument();
    expect(screen.getByText("escButtonClearLog")).toBeInTheDocument();
    expect(screen.getByText(/escButtonFlashAll/i)).toBeInTheDocument();
  });

  it('should display warning when wrong dead-time detected', () => {
    storeRef.store.dispatch(setSelecting(true));

    const settings = {
      LAYOUT_REVISION: 0,
      MAIN_REVISION: 1,
      SUB_REVISION: 2,
      NAME: 'NAME',
    };

    const escs = [
      {
        index: 0,
        make: 'make',
        actualMake: 'actualMake',
        meta: { available: true },
        settings: {
          LAYOUT_REVISION: 0,
          MODE: 0,
          STARTUP_BEEP: 0,
        },
        bootloaderRevision: 'bl 23',
        individualSettings: {
          LAYOUT_REVISION: 0,
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
      },
    ];

    render(
      <MainContent
        escs={escs}
        flashTargets={[0]}
        onAllMotorSpeed={onAllMotorSpeed}
        onCancelFirmwareSelection={onCancelFirmwareSelection}
        onFlashUrl={onFlashUrl}
        onIndividualSettingsUpdate={onIndividualSettingsUpdate}
        onLocalSubmit={onLocalSubmit}
        onOpenMelodyEditor={onOpenMelodyEditor}
        onReadEscs={onReadEscs}
        onResetDefaultls={onResetDefaultls}
        onSelectFirmwareForAll={onSelectFirmwareForAll}
        onSettingsUpdate={onSettingsUpdate}
        onSingleFlash={onSingleFlash}
        onSingleMotorSpeed={onSingleMotorSpeed}
        onWriteSetup={onWriteSetup}
        open
        settings={settings}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/mistaggedLine1/i)).toBeInTheDocument();
  });
});
