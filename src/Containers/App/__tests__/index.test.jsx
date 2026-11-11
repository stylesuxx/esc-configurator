import React from 'react';
import {
  render, screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

import { store } from '../../../store';

import { fetch as fetchConfigs } from '../configsSlice';
import { set as setMspFeatures } from '../mspSlice';
import {
  setDisconnecting,
  setReading,
  setWriting,
  setSelecting,
  setFlashing,
  setConnecting,
  reset as resetState,
} from '../stateSlice';

let App;

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));
jest.mock('i18next', () => ({
  changeLanguage: () => null,
  t: () => null,
}));

describe('App', () => {
  beforeAll(async () => {
    /**
     * require component instead of import so that we can properly
     * pre-populate the local storage
     */
    App = require('../').default;
  });

  test('should render container', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByAltText(/Discord/i)).toBeInTheDocument();

    // Ensure that a warning is displayed when no web Serial is detected
    expect(screen.getByText(/is not supported on your browser/i)).toBeInTheDocument();

    // Ensure that the footer is there
    expect(screen.getByText(/statusbarPortUtilization/i)).toBeInTheDocument();
    expect(screen.getByText(/statusbarPacketError/i)).toBeInTheDocument();

    // Click the Settings
    userEvent.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByText(/settingsHeader/i)).toBeInTheDocument();

    // Open Melody editor
    userEvent.click(screen.getByRole('button', { name: /openMelodyEditor/i }));
    expect(screen.getByText(/melodyEditorHeader/i)).toBeInTheDocument();
  });
});

describe('configSlice', () => {
  it('should fetch configs', async() => {
    await store.dispatch(fetchConfigs());

    const configs = store.getState().configs;
    expect(configs.escs["BLHeli_S"]).not.toBeNull();
    expect(configs.escs["Bluejay"]).not.toBeNull();
  });
});

describe('mspSlice', () => {
  it('should set msp features', () => {
    store.dispatch(setMspFeatures({ feature: 'value' }));

    const msp = store.getState().msp;
    expect(msp.features.feature).toEqual('value');
  });
});

describe('stateSlice', () => {
  it('should change isReading', () => {
    let state = store.getState().state;
    expect(state.isReading).toBeFalsy();

    store.dispatch(setReading(true));

    state = store.getState().state;
    expect(state.isReading).toBeTruthy();
  });

  it('should change isWriting', () => {
    let state = store.getState().state;
    expect(state.isWriting).toBeFalsy();

    store.dispatch(setWriting(true));

    state = store.getState().state;
    expect(state.isWriting).toBeTruthy();
  });

  it('should change isSelecting', () => {
    let state = store.getState().state;
    expect(state.isSelecting).toBeFalsy();

    store.dispatch(setSelecting(true));

    state = store.getState().state;
    expect(state.isSelecting).toBeTruthy();
  });

  it('should change isFlashing', () => {
    let state = store.getState().state;
    expect(state.isFlashing).toBeFalsy();

    store.dispatch(setFlashing(true));

    state = store.getState().state;
    expect(state.isFlashing).toBeTruthy();
  });

  it('should change isConnecting', () => {
    let state = store.getState().state;
    expect(state.isConnecting).toBeFalsy();

    store.dispatch(setConnecting(true));

    state = store.getState().state;
    expect(state.isConnecting).toBeTruthy();
  });

  it('should change isDisconnecting', () => {
    let state = store.getState().state;
    expect(state.isDisconnecting).toBeFalsy();

    store.dispatch(setDisconnecting(true));

    state = store.getState().state;
    expect(state.isDisconnecting).toBeTruthy();
  });

  it('should reset state', () => {
    let state = store.getState().state;
    expect(state.isDisconnecting).toBeTruthy();

    store.dispatch(resetState());

    state = store.getState().state;
    expect(state.isDisconnecting).toBeFalsy();
  });
});

describe('App writing common settings', () => {
  const bluejay = (index, revision, pwm) => ({
    index,
    firmwareName: 'Bluejay',
    layoutRevision: revision,
    settings: {
      LAYOUT_REVISION: Number(revision),
      PWM_FREQUENCY: pwm,
      BEEP_STRENGTH: 40,
      MOTOR_DIRECTION: 2,
    },
    individualSettings: { MOTOR_DIRECTION: 2 },
  });

  it('should keep the PWM frequency each ESC was flashed with (Bluejay 0.19)', () => {
    const { App: AppClass } = require('../');
    const app = new AppClass();
    // ESC 1 to 3 built for 48 kHz, ESC 4 flashed with the 24 kHz file
    const master = {
      ...bluejay(0, '206', 48).settings,
      BEEP_STRENGTH: 60,
    };

    const merged = app.getMergedSettings(bluejay(3, '206', 24), master);
    expect(merged.PWM_FREQUENCY).toEqual(24);
    // A common setting changed on the screen still goes to every ESC
    expect(merged.BEEP_STRENGTH).toEqual(60);
  });

  it('should still copy the PWM frequency where it is a common setting (Bluejay 0.18)', () => {
    const { App: AppClass } = require('../');
    const app = new AppClass();
    const master = bluejay(0, '205', 48).settings;

    const merged = app.getMergedSettings(bluejay(3, '205', 24), master);
    expect(merged.PWM_FREQUENCY).toEqual(48);
  });
});

describe('App with an ESC marked FLASH*FAILED', () => {
  const esc = (index, name, beep) => ({
    index,
    firmwareName: 'Bluejay',
    layoutRevision: '206',
    meta: { available: true },
    settings: {
      NAME: name,
      BEEP_STRENGTH: beep,
      MOTOR_DIRECTION: 2,
    },
    individualSettings: { MOTOR_DIRECTION: 2 },
    defaultSettings: { BEEP_STRENGTH: 40 },
  });

  // ESC 1 is marked FLASH*FAILED, ESC 2 to 4 are healthy
  const escs = () => [
    esc(0, '**FLASH*FAILED**', 10),
    esc(1, 'Bluejay', 77),
    esc(2, 'Bluejay', 40),
    esc(3, 'Bluejay', 40),
  ];

  const setup = () => {
    const { App: AppClass } = require('../');
    const {
      setIndividual, setMaster,
    } = require('../escsSlice');
    const { getMasterSettings } = require('../../../utils/helpers/Settings');
    const app = new AppClass();
    app.addLogMessage = jest.fn();
    app.handleReadEsc = jest.fn(async() => ({
      settingsArray: [],
      settings: {},
      displayName: '',
    }));
    app.handleReadEscs = jest.fn();
    app.serial = { writeSettings: jest.fn() };

    const individual = escs();
    store.dispatch(setIndividual(individual));
    store.dispatch(setMaster(getMasterSettings(individual)));

    const cleanUp = () => {
      store.dispatch(setIndividual([]));
      store.dispatch(setMaster({}));
    };

    return {
      app,
      cleanUp,
    };
  };

  it('should skip that ESC and write the healthy ones with the settings of the first healthy ESC', async() => {
    const {
      app, cleanUp,
    } = setup();

    await app.handleWriteSettings();

    const targets = app.serial.writeSettings.mock.calls.map((call) => call[0]);
    expect(targets).toEqual([1, 2, 3]);
    app.serial.writeSettings.mock.calls.forEach((call) => {
      expect(call[2].BEEP_STRENGTH).toEqual(77);
    });
    expect(app.addLogMessage).toHaveBeenCalledWith('writeSettingsBlockedFlashFailed', { index: 1 });
    expect(app.addLogMessage.mock.calls.filter((call) => call[0] === 'writeSettingsBlockedFlashFailed')).toHaveLength(1);
    cleanUp();
  });

  it('should skip that ESC when restoring the defaults too', async() => {
    const {
      app, cleanUp,
    } = setup();

    await app.handleResetDefaultls();

    const targets = app.serial.writeSettings.mock.calls.map((call) => call[0]);
    expect(targets).toEqual([1, 2, 3]);
    expect(app.addLogMessage).toHaveBeenCalledWith('writeSettingsBlockedFlashFailed', { index: 1 });
    expect(app.addLogMessage.mock.calls.filter((call) => call[0] === 'writeSettingsBlockedFlashFailed')).toHaveLength(1);
    cleanUp();
  });
});

describe('escsSlice with an ESC marked FLASH*FAILED', () => {
  it('should not give the common settings to that ESC', () => {
    const {
      setIndividual, setMaster, updateIndividual,
    } = require('../escsSlice');

    store.dispatch(setIndividual([
      {
        index: 0,
        settings: { NAME: '**FLASH*FAILED**' },
      },
      {
        index: 1,
        settings: {
          NAME: 'Bluejay',
          BEEP_STRENGTH: 40,
        },
      },
    ]));
    store.dispatch(setMaster({
      NAME: 'Bluejay',
      BEEP_STRENGTH: 60,
    }));
    store.dispatch(updateIndividual());

    const [failed, healthy] = store.getState().escs.individual;
    expect(failed.settings.NAME).toEqual('**FLASH*FAILED**');
    expect(healthy.settings.BEEP_STRENGTH).toEqual(60);

    store.dispatch(setIndividual([]));
    store.dispatch(setMaster({}));
  });
});
