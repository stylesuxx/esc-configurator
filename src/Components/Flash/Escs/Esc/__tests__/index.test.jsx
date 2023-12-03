import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import settingsReducer, { update } from '../../../../AppSettings/settingsSlice';
import escsReducer, { setIndividual } from '../../../../../Containers/App/escsSlice';
import stateReducer from '../../../../../Containers/App/stateSlice';

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

let onFirmwareDump;

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

describe('Esc', () => {
  const storeRef = setupTestStore();

  beforeEach(() => {
    onFirmwareDump = jest.fn();
  });

  it('should display ESC details', () => {
    const esc = { individualSettings: {} };

    render(
      <Esc
        esc={esc}
        index={0}
        onFirmwareDump={onFirmwareDump}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/Unsupported\/Unrecognized/i)).toBeInTheDocument();
    expect(screen.getByText(/escButtonFlash/i)).toBeInTheDocument();
    expect(screen.getByText(/ESC 1/i)).toBeInTheDocument();
  });

  it('should show name, version and bootloader', () => {
    const esc = {
      bootloaderRevision: 'bl 23',
      displayName: 'displayName 1234',
      individualSettings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 200,
        NAME: 'FW Name',
      },
    };

    render(
      <Esc
        esc={esc}
        index={0}
        onFirmwareDump={onFirmwareDump}
        progress={50}
      />,
      { wrapper: storeRef.wrapper }
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

    render(
      <Esc
        esc={esc}
        index={0}
        onFirmwareDump={onFirmwareDump}
      />,
      { wrapper: storeRef.wrapper }
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

    render(
      <Esc
        esc={esc}
        index={0}
        onFirmwareDump={onFirmwareDump}
      />,
      { wrapper: storeRef.wrapper }
    );

    const flashButton = screen.getByText(/escButtonFlash/i);
    userEvent.click(flashButton);
    expect(flashButton.getAttribute("disabled")).toBe("");
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
    storeRef.store.dispatch(setIndividual([esc]));

    render(
      <Esc
        esc={esc}
        index={0}
        onFirmwareDump={onFirmwareDump}
      />,
      { wrapper: storeRef.wrapper }
    );

    userEvent.click(screen.getByText(/escButtonFlash/i));

    const { targets } = storeRef.store.getState().escs;
    expect(targets.length).toEqual(1);
  });

  it('should show custom settings and handle change', () => {
    const esc = {
      firmwareName: 'BLHeli_S',
      layoutRevision: 33,
      individualSettings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 200,
        NAME: 'FW Name',
        MOTOR_DIRECTION: 1,
        _PPM_MIN_THROTTLE: 125,
        STARTUP_BEEP: 0,
      },
    };

    render(
      <Esc
        esc={esc}
        index={0}
        onFirmwareDump={onFirmwareDump}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/escMotorDirection/i)).toBeInTheDocument();
    expect(screen.getByText(/escPPMMinThrottle/i)).toBeInTheDocument();
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();

    // Change select
    fireEvent.change(screen.getByRole(/combobox/i), {
      taget: {
        value: 3,
        name: 'MOTOR_DIRECTION',
      },
    });
  });

  it('should show custom settings and handle direct input', () => {
    storeRef.store.dispatch(update({
      name: 'disableCommon',
      value: true,
    }));

    storeRef.store.dispatch(update({
      name: 'directInput',
      value: true,
    }));

    const esc = {
      firmwareName: 'BLHeli_S',
      layoutRevision: 33,
      settings: { PROGRAMMING_BY_TX: 1 },
      individualSettings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 200,
        NAME: 'FW Name',
        MOTOR_DIRECTION: 1,
        _PPM_MIN_THROTTLE: 125,
        STARTUP_BEEP: 1,
      },
    };

    render(
      <Esc
        esc={esc}
        index={0}
        onFirmwareDump={onFirmwareDump}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/escMotorDirection/i)).toBeInTheDocument();
    expect(screen.getByText(/escPPMMinThrottle/i)).toBeInTheDocument();
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId('PPM_MIN_THROTTLE'), {
      target: {
        value: 1250,
        name: 'PPM_MIN_THROTTLE',
      },
    });
    fireEvent.blur(screen.getByTestId('PPM_MIN_THROTTLE'));
  });

  it('should update the progress bar', () => {
    storeRef.store.dispatch(update({
      name: 'directInput',
      value: true,
    }));

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
    };

    const ref = React.createRef();

    render(
      <Esc
        esc={esc}
        index={0}
        onFirmwareDump={onFirmwareDump}
        ref={ref}
      />,
      { wrapper: storeRef.wrapper }
    );

    const progressbar = screen.getByRole(/progressbar/i);
    expect(progressbar).toBeInTheDocument();

    act(() => ref.current.setProgress(50));
    expect(progressbar.value).toEqual(50);

    act(() => ref.current.setProgress(100));
    expect(progressbar.value).toEqual(100);
  });

  it('should show common settings and handle change', () => {
    storeRef.store.dispatch(update({
      name: 'disableCommon',
      value: true,
    }));

    const esc = {
      firmwareName: 'Bluejay',
      layoutRevision: 207,
      settings: {},
      individualSettings: { MOTOR_DIRECTION: 1 },
    };

    render(
      <Esc
        esc={esc}
        index={0}
        onFirmwareDump={onFirmwareDump}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/hints:MOTOR_DIRECTION/i)).toBeInTheDocument();
    expect(screen.getByText(/escMotorDirection/i)).toBeInTheDocument();

    userEvent.click(screen.getByRole(/checkbox/i, { name: 'DITHERING' }));

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'MOTOR_DIRECTION' }), {
      taget: {
        value: 3,
        name: 'MOTOR_DIRECTION',
      },
    });
  });

  it('should show common settings and handle checkbox check', () => {
    storeRef.store.dispatch(update({
      name: 'disableCommon',
      value: true,
    }));

    const esc = {
      index: 0,
      firmwareName: 'Bluejay',
      layoutRevision: 207,
      settings: { DITHERING: 0 },
      individualSettings: { DITHERING: 0 },
    };
    storeRef.store.dispatch(setIndividual([esc]));

    render(
      <Esc
        esc={esc}
        index={0}
        onFirmwareDump={onFirmwareDump}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/hints:DITHERING/i)).toBeInTheDocument();
    expect(screen.getByRole(/checkbox/i, { name: 'DITHERING' })).toBeInTheDocument();

    userEvent.click(screen.getByRole(/checkbox/i, { name: 'DITHERING' }));

    const { individual } = storeRef.store.getState().escs;
    expect(individual[0].settings.DITHERING).toEqual(1);
    expect(individual[0].individualSettings.DITHERING).toEqual(0);
  });

  it('should handle checkbox uncheck', () => {
    storeRef.store.dispatch(update({
      name: 'disableCommon',
      value: true,
    }));

    const esc = {
      index: 0,
      firmwareName: 'Bluejay',
      layoutRevision: 207,
      settings: { DITHERING: 1 },
      individualSettings: { DITHERING: 1 },
    };
    storeRef.store.dispatch(setIndividual([esc]));

    render(
      <Esc
        esc={esc}
        index={0}
        onFirmwareDump={onFirmwareDump}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/hints:DITHERING/i)).toBeInTheDocument();
    expect(screen.getByRole(/checkbox/i, { name: 'DITHERING' })).toBeInTheDocument();

    userEvent.click(screen.getByRole(/checkbox/i, { name: 'DITHERING' }));

    const { individual } = storeRef.store.getState().escs;
    expect(individual[0].settings.DITHERING).toEqual(0);
    expect(individual[0].individualSettings.DITHERING).toEqual(1);
  });

  it('should trigger firmware dump', () => {
    storeRef.store.dispatch(update({
      name: 'enableAdvanced',
      value: true,
    }));

    const esc = {
      bootloaderRevision: 'bl 23',
      individualSettings: {
        MAIN_REVISION: 1,
        SUB_REVISION: 200,
        NAME: 'FW Name',
      },
    };
    storeRef.store.dispatch(setIndividual([esc]));

    render(
      <Esc
        esc={esc}
        index={0}
        onFirmwareDump={onFirmwareDump}
      />,
      { wrapper: storeRef.wrapper }
    );

    userEvent.click(screen.getByText(/escButtonFirmwareDump/i));
    expect(onFirmwareDump).toHaveBeenCalled();
  });
});
