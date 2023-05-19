import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import escsReducer, {
  setConnected,
  setIndividual,
  setMaster,
} from '../../../Containers/App/escsSlice';
import settingsReducer, { update } from '../../AppSettings/settingsSlice';
import stateReducer from '../../../Containers/App/stateSlice';

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

function setupTestStore() {
  const refObj = {};

  beforeEach(() => {
    const store = configureStore({
      reducer: {
        escs: escsReducer,
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

let onFlash;
let onCommonSettingsUpdate;
let onIndividualSettingsUpdate;
let onSettingsUpdate;
let onFirmwareDump;

const progressReferences = [];
for(let i = 0; i < 4; i += 1) {
  progressReferences.push(React.createRef());
}

describe('Flash', () => {
  const storeRef = setupTestStore();

  beforeEach(() => {
    onFlash = jest.fn();
    onCommonSettingsUpdate = jest.fn();
    onIndividualSettingsUpdate = jest.fn();
    onSettingsUpdate = jest.fn();
    onFirmwareDump = jest.fn();
  });

  it('should load and display unsupported custom settings', () => {
    const availableSettings = {
      LAYOUT_REVISION: 203,
      MAIN_REVISION: 1,
      NAME: 'FW name',
      SUB_REVISION: 100,
    };
    storeRef.store.dispatch(setMaster(availableSettings));

    const escs = [
      {
        index: 0,
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
    storeRef.store.dispatch(setIndividual(escs));

    render(
      <Flash
        onCommonSettingsUpdate={onCommonSettingsUpdate}
        onFirmwareDump={onFirmwareDump}
        onFlash={onFlash}
        onIndividualSettingsUpdate={onIndividualSettingsUpdate}
        onSettingsUpdate={onSettingsUpdate}
        progressReferences={progressReferences}
        unsupported={false}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/commonParameters/i)).toBeInTheDocument();
  });

  it('should load and display seperate settings', () => {
    storeRef.store.dispatch(update({
      name: 'disableCommon',
      value: true,
    }));

    const availableSettings = {
      LAYOUT_REVISION: 203,
      MAIN_REVISION: 1,
      NAME: 'FW name',
      SUB_REVISION: 100,
    };
    storeRef.store.dispatch(setMaster(availableSettings));

    const escs = [
      {
        index: 0,
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
    storeRef.store.dispatch(setIndividual(escs));

    render(
      <Flash
        onCommonSettingsUpdate={onCommonSettingsUpdate}
        onFirmwareDump={onFirmwareDump}
        onFlash={onFlash}
        onIndividualSettingsUpdate={onIndividualSettingsUpdate}
        onSettingsUpdate={onSettingsUpdate}
        progressReferences={progressReferences}
        unsupported={false}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.queryByText(/commonParameters/i)).not.toBeInTheDocument();
    expect(screen.getByText(/commonSettingsDisabledText/i)).toBeInTheDocument();
  });

  it('should displays missing ESC warning', () => {
    storeRef.store.dispatch(setConnected(4));

    const availableSettings = {
      LAYOUT_REVISION: 203,
      MAIN_REVISION: 1,
      NAME: 'FW name',
      SUB_REVISION: 100,
    };
    storeRef.store.dispatch(setMaster(availableSettings));

    const escs = [
      {
        index: 0,
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
    storeRef.store.dispatch(setIndividual(escs));

    render(
      <Flash
        onCommonSettingsUpdate={onCommonSettingsUpdate}
        onFirmwareDump={onFirmwareDump}
        onFlash={onFlash}
        onIndividualSettingsUpdate={onIndividualSettingsUpdate}
        onSettingsUpdate={onSettingsUpdate}
        progressReferences={progressReferences}
        unsupported={false}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/commonParameters/i)).toBeInTheDocument();
    expect(screen.getByText(/commonParameters/i)).toBeInTheDocument();
  });
});
