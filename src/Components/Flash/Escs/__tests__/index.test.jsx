import React from 'react';
import {
  render, screen,
} from '@testing-library/react';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import settingsReducer from '../../../AppSettings/settingsSlice';
import escsReducer, { setIndividual } from '../../../../Containers/App/escsSlice';
import stateReducer from '../../../../Containers/App/stateSlice';

import Escs from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

let onCommonSettingsUpdate;
let onFirmwareDump;
let onFlash;
let onSettingsUpdate;

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

describe('Escs', () => {
  const storeRef = setupTestStore();

  beforeEach(() => {
    onCommonSettingsUpdate = jest.fn();
    onSettingsUpdate = jest.fn();
    onFlash = jest.fn();
    onFirmwareDump = jest.fn();
  });

  it('should not show ESCs without ESCs', () => {
    const onFlash = jest.fn();

    render(
      <Escs
        canFlash={false}
        onCommonSettingsUpdate={onCommonSettingsUpdate}
        onFirmwareDump={onFirmwareDump}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
        progressReferences={[]}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.queryByText(/ESC 1/i)).not.toBeInTheDocument();
  });

  it('should show details with ESCs', () => {
    const esc = {
      bootloaderRevision: 'bl 23',
      make: 'make 1234',
      individualSettings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 200,
        NAME: 'FW Name',
      },
    };
    const escs = [];
    const flashProgress = [];
    const progressReferences = [];

    for(let i = 0; i < 4; i += 1) {
      const current = { ...esc };
      current.index = i;
      escs.push(current);
      progressReferences.push(React.createRef());
      flashProgress.push(0);
    }
    storeRef.store.dispatch(setIndividual(escs));

    render(
      <Escs
        flashProgress={flashProgress}
        onCommonSettingsUpdate={onCommonSettingsUpdate}
        onFirmwareDump={onFirmwareDump}
        onFlash={onFlash}
        onSettingsUpdate={onSettingsUpdate}
        progress={flashProgress}
        progressReferences={progressReferences}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/ESC 1/i)).toBeInTheDocument();
    expect(screen.getByText(/ESC 2/i)).toBeInTheDocument();
    expect(screen.getByText(/ESC 3/i)).toBeInTheDocument();
    expect(screen.getByText(/ESC 4/i)).toBeInTheDocument();
  });
});
