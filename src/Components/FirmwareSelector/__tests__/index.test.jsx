import React from 'react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import configsReducer, { set } from '../../../Containers/App/configsSlice';

import sources from '../../../sources';
import settingsReducer from '../../AppSettings/settingsSlice';
import escsReducer from '../../../Containers/App/escsSlice';

let FirmwareSelector;

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

function setupTestStore() {
  const refObj = {};

  beforeEach(() => {
    const store = configureStore({
      reducer: {
        configs: configsReducer,
        escs: escsReducer,
        settings: settingsReducer,
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

const mockJsonResponse = (content) =>
  new window.Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Time-Cached': Date.now().toString(),
    },
  });

let onSubmit;
let onLocalSubmit;

describe('FirmwareSelector', () => {
  const storeRef = setupTestStore();

  beforeAll(async () => {
    /**
     * require component instead of import so that we can properly
     * pre-populate the local storage
     */
    FirmwareSelector = require('../').default;
  });

  beforeEach(() => {
    onSubmit = jest.fn();
    onLocalSubmit = jest.fn();
  });

  it('should display firmware selection', () => {
    render(
      <FirmwareSelector
        onLocalSubmit={onLocalSubmit}
        onSubmit={onSubmit}
        showUnstable={false}
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

  it('should allow changing firmware options for BLHeli_S', async() => {
    const json = `[{ "tag_name": "v0.10.0", "assets": [{}] }]`;
    global.caches = {
      open: jest.fn().mockImplementation(() =>
        new Promise((resolve) => {
          resolve({ match: () => new Promise((resolve) => resolve(mockJsonResponse(json))) });
        })
      ),
    };

    const configs = {
      versions: {},
      escs: {},
    };

    for(let i = 0; i < sources.length; i += 1) {
      const source = sources[i];
      const name = source.getName();

      configs.versions[name] = await source.getVersions();
      configs.escs[name] = source.getEscLayouts();
    }

    storeRef.store.dispatch(set(configs));

    const escMock = {
      settings: { LAYOUT: "#S_H_90#" },
      meta: { signature: 0xE8B2 },
    };

    render(
      <FirmwareSelector
        esc={escMock}
        onLocalSubmit={onLocalSubmit}
        onSubmit={onSubmit}
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

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'Firmware' }), {
      target: {
        value: 'BLHeli_S',
        name: 'Firmware',
      },
    });

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'ESC' }), {
      target: {
        value: '#S_H_50#',
        name: 'ESC',
      },
    });

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'Version' }), {
      target: {
        value: 'https://raw.githubusercontent.com/bitdump/BLHeli/master/BLHeli_S SiLabs/Hex files/{0}_REV16_7.HEX',
        name: 'Version',
      },
    });

    const checkboxes = screen.getAllByRole(/checkbox/i);
    for(let i = 0; i < checkboxes.length; i += 1) {
      userEvent.click(checkboxes[i]);
    }

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'Firmware' }), {
      target: {
        value: 'Bluejay',
        name: 'Firmware',
      },
    });

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'ESC' }), {
      target: {
        value: '#S_H_50#',
        name: 'ESC',
      },
    });

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'Version' }), {
      target: {
        value: 'https://github.com/bird-sanctuary/bluejay/releases/download/v0.10.0/',
        name: 'Version',
      },
    });

    expect(screen.getByText(/96/i)).toBeInTheDocument();
    fireEvent.change(screen.getByRole(/combobox/i, { name: 'PWM Frequency' }), {
      target: {
        value: '96',
        name: 'PWM Frequency',
      },
    });

    expect(screen.getByText("escButtonSelect")).toBeInTheDocument();
    userEvent.click(screen.getByText('escButtonSelect'));
    expect(onSubmit).toHaveBeenCalled();

    userEvent.click(screen.getByText('escButtonSelectLocally'));
    fireEvent.change(screen.getByTestId('input-file'));
    expect(onLocalSubmit).toHaveBeenCalled();

    userEvent.click(screen.getByText('buttonCancel'));
    const { targets } = storeRef.store.getState().escs;
    expect(targets.length).toBe(0);
  });

  it('should display title', async() => {
    const json = `[{ "tag_name": "v0.10.0", "assets": [{}] }]`;
    global.caches = {
      open: jest.fn().mockImplementation(() =>
        new Promise((resolve) => {
          resolve({ match: () => new Promise((resolve) => resolve(mockJsonResponse(json))) });
        })
      ),
    };

    const configs = {
      versions: {},
      escs: {},
    };

    for(let i = 0; i < sources.length; i += 1) {
      const source = sources[i];
      const name = source.getName();

      configs.versions[name] = await source.getVersions();
      configs.escs[name] = source.getEscLayouts();
    }

    const escMock = {
      displayName: 'Display Name',
      settings: { LAYOUT: "#S_H_90#" },
      meta: { signature: 0xE8B2 },
    };

    render(
      <FirmwareSelector
        esc={escMock}
        onLocalSubmit={onLocalSubmit}
        onSubmit={onSubmit}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText('selectTarget (Display Name)')).toBeInTheDocument();
  });

  it('should allow changing firmware options for AM32', async() => {
    const json = `[{ "tag_name": "v1.94", "assets": [{}] }]`;
    global.caches = {
      open: jest.fn().mockImplementation(() =>
        new Promise((resolve) => {
          resolve({ match: () => new Promise((resolve) => resolve(mockJsonResponse(json))) });
        })
      ),
    };

    const configs = {
      versions: {},
      escs: {},
    };

    for(let i = 0; i < sources.length; i += 1) {
      const source = sources[i];
      const name = source.getName();

      configs.versions[name] = await source.getVersions();
      configs.escs[name] = source.getEscLayouts();
    }

    storeRef.store.dispatch(set(configs));

    const escMock = {
      settings: { LAYOUT: "T-MOTOR 55A" },
      meta: {
        am32: {
          fileName: 'T-MOTOR_55A',
          mcuType: 'F051',
        },
        signature: 0x1F06,
      },
    };

    render(
      <FirmwareSelector
        esc={escMock}
        onLocalSubmit={onLocalSubmit}
        onSubmit={onSubmit}
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

    expect(screen.getByText(/selectFirmware/i)).toBeDisabled();

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'Version' }), {
      target: {
        value: 'https://github.com/AlkaMotors/AM32-MultiRotor-ESC-firmware/releases/download/v1.94/',
        name: 'Version',
      },
    });

    userEvent.click(screen.getByText('escButtonSelect'));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('should disable esc layout selection after version 1.93', async () => {
    const json = `[{ "tag_name": "v1.94", "assets": [{}] }]`;
    global.caches = {
      open: jest.fn().mockImplementation(() =>
        new Promise((resolve) => {
          resolve({ match: () => new Promise((resolve) => resolve(mockJsonResponse(json))) });
        })
      ),
    };

    const configs = {
      versions: {},
      escs: {},
    };

    for(let i = 0; i < sources.length; i += 1) {
      const source = sources[i];
      const name = source.getName();

      configs.versions[name] = await source.getVersions();
      configs.escs[name] = source.getEscLayouts();
    }

    storeRef.store.dispatch(set(configs));

    const escMock = {
      settings: { LAYOUT: "T-MOTOR 55A" },
      meta: { signature: 0x1F06 },
    };

    render(
      <FirmwareSelector
        esc={escMock}
        onLocalSubmit={onLocalSubmit}
        onSubmit={onSubmit}
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

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'Version' }), {
      target: {
        value: 'https://github.com/AlkaMotors/AM32-MultiRotor-ESC-firmware/releases/download/v1.94/',
        name: 'Version',
      },
    });

    userEvent.click(screen.getByText('escButtonSelect'));
    expect(onSubmit).toHaveBeenCalled();
  });

  //TODO: Once v0.20.0 is released, add this test
  /*
  it('should not show PMW selection for Bluejay v0.20.0 and up', async() => {
    const json = `[{ "tag_name": "v0.20.0", "assets": [{}] }]`;
    global.caches = {
      open: jest.fn().mockImplementation(() =>
        new Promise((resolve) => {
          resolve({ match: () => new Promise((resolve) => resolve(mockJsonResponse(json))) });
        })
      ),
    };

    const configs = {
      versions: {},
      escs: {},
    };

    for(let i = 0; i < sources.length; i += 1) {
      const source = sources[i];
      const name = source.getName();

      configs.versions[name] = await source.getVersions();
      configs.escs[name] = source.getEscLayouts();
    }

    const onSubmit = jest.fn();
    const onLocalSubmit = jest.fn();
    const onCancel = jest.fn();

    const escMock = {
      settings: { LAYOUT: "#S_H_90#" },
      meta: { signature: 0xE8B2 },
    };

    render(
      <FirmwareSelector
        esc={escMock}
        onCancel={onCancel}
        onLocalSubmit={onLocalSubmit}
        onSubmit={onSubmit}
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

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'Version' }), {
      target: {
        value: 'https://github.com/bird-sanctuary/bluejay/releases/download/v0.20.0/',
        name: 'Version',
      },
    });

    expect(screen.queryByText(/96/i)).not.toBeInTheDocument();

    expect(screen.getByText("escButtonSelect")).toBeInTheDocument();
    userEvent.click(screen.getByText('escButtonSelect'));
    expect(onSubmit).toHaveBeenCalled();

    userEvent.click(screen.getByText('escButtonSelectLocally'));
    fireEvent.change(screen.getByTestId('input-file'));
    expect(onLocalSubmit).toHaveBeenCalled();

    userEvent.click(screen.getByText('buttonCancel'));
    expect(onCancel).toHaveBeenCalled();
  });
  */
});
