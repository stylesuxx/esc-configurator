import React from 'react';
import {
  render, screen, fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import escsReducer, {
  setIndividual, setMaster,
} from '../../../../Containers/App/escsSlice';
import settingsReducer, { update } from '../../../AppSettings/settingsSlice';
import stateReducer from '../../../../Containers/App/stateSlice';

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

describe('CommonSettings', () => {
  const storeRef = setupTestStore();

  it('should display when settings are unsopported', () => {
    const availableSettings = {
      LAYOUT_REVISION: 203,
      MAIN_REVISION: 1,
      NAME: 'FW name',
      SUB_REVISION: 100,
    };
    storeRef.store.dispatch(setMaster(availableSettings));

    const escs = [
      {
        meta: { available: true },
        settings: { MODE: 1 },
      },
    ];
    storeRef.store.dispatch(setIndividual(escs));

    const onFlash = jest.fn();

    render(
      <CustomSettings
        index={0}
        onFlash={onFlash}
        unsupported={false}
      />,
      { wrapper: storeRef.wrapper }
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
      _PPM_MIN_THROTTLE: 1200,
    };
    storeRef.store.dispatch(setMaster(availableSettings));

    const escs = [
      {
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

    const onFlash = jest.fn();

    render(
      <CustomSettings
        availableSettings={availableSettings}
        directInput={false}
        escs={escs}
        index={0}
        onFlash={onFlash}
        unsupported={false}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/commonParameters/i)).toBeInTheDocument();

    expect(screen.getByText(/escMinStartupPower/i)).toBeInTheDocument();

    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
  });

  it('should allow to check checkbox', () => {
    const availableSettings = {
      LAYOUT_REVISION: 203,
      MAIN_REVISION: 1,
      NAME: 'FW name',
      SUB_REVISION: 100,
      STARTUP_BEEP: 0,
      MOTOR_DIRECTION: 1,
      _PPM_MIN_THROTTLE: 1200,
      DITHERING: 0,
    };
    storeRef.store.dispatch(setMaster(availableSettings));

    const esc = {
      firmwareName: 'Bluejay',
      layoutRevision: 207,
      meta: { available: true },
      settings: {
        MODE: 0,
        STARTUP_BEEP: 0,
        DITHERING: 0,
      },
      make: 'make 1234',
    };

    const escs = [];
    for(let i = 0; i < 4; i += 1) {
      const current = { ...esc };
      escs.push(current);
    }
    storeRef.store.dispatch(setIndividual(escs));

    const onFlash = jest.fn();

    render(
      <CustomSettings
        availableSettings={availableSettings}
        directInput={false}
        escs={escs}
        index={0}
        onFlash={onFlash}
        unsupported={false}
      />,
      { wrapper: storeRef.wrapper }
    );

    const checkbox = screen.getByRole(/checkbox/i, { name: 'DITHERING' });
    expect(checkbox.checked).toEqual(false);

    userEvent.click(screen.getByRole(/checkbox/i, { name: 'DITHERING' }));
  });

  it('should allow to change select', () => {
    const availableSettings = {
      LAYOUT_REVISION: 203,
      MAIN_REVISION: 1,
      NAME: 'FW name',
      SUB_REVISION: 100,
      STARTUP_BEEP: 0,
      MOTOR_DIRECTION: 1,
      _PPM_MIN_THROTTLE: 1200,
      DITHERING: 1,
    };
    storeRef.store.dispatch(setMaster(availableSettings));

    const esc = {
      firmwareName: 'Bluejay',
      layoutRevision: 207,
      meta: { available: true },
      settings: {
        MODE: 0,
        STARTUP_BEEP: 0,
        DITHERING: 1,
      },
      make: 'make 1234',
    };

    const escs = [];

    for(let i = 0; i < 4; i += 1) {
      const current = { ...esc };
      escs.push(current);
    }
    storeRef.store.dispatch(setIndividual(escs));

    const onFlash = jest.fn();

    render(
      <CustomSettings
        index={0}
        onFlash={onFlash}
        unsupported={false}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.queryByText(/unsupportedFirmware/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole(/combobox/i, { name: 'TEMPERATURE_PROTECTION' }), {
      taget: {
        value: 3,
        name: 'TEMPERATURE_PROTECTION',
      },
    });
  });

  it('should allow to uncheck checkbox', () => {
    const availableSettings = {
      LAYOUT_REVISION: 203,
      MAIN_REVISION: 1,
      NAME: 'FW name',
      SUB_REVISION: 100,
      STARTUP_BEEP: 0,
      MOTOR_DIRECTION: 1,
      _PPM_MIN_THROTTLE: 1200,
      DITHERING: 1,
    };
    storeRef.store.dispatch(setMaster(availableSettings));

    const esc = {
      firmwareName: 'Bluejay',
      layoutRevision: 207,
      meta: { available: true },
      settings: {
        MODE: 0,
        STARTUP_BEEP: 0,
        DITHERING: 1,
      },
      make: 'make 1234',
    };

    const escs = [];
    for(let i = 0; i < 4; i += 1) {
      const current = { ...esc };
      escs.push(current);
    }
    storeRef.store.dispatch(setIndividual(escs));

    const onFlash = jest.fn();

    render(
      <CustomSettings
        index={0}
        onFlash={onFlash}
        unsupported={false}
      />,
      { wrapper: storeRef.wrapper }
    );

    const checkbox = screen.getByRole(/checkbox/i, { name: 'DITHERING' });
    expect(checkbox.checked).toEqual(true);

    userEvent.click(screen.getByRole(/checkbox/i, { name: 'DITHERING' }));
  });

  it('should allow updating with direct input', () => {
    storeRef.store.dispatch(update({
      name: 'directInput',
      value: true,
    }));

    const availableSettings = {
      LAYOUT_REVISION: 203,
      MAIN_REVISION: 1,
      NAME: 'FW name',
      SUB_REVISION: 100,
      _PPM_MIN_THROTTLE: 1200,
    };
    storeRef.store.dispatch(setMaster(availableSettings));

    const escs = [
      {
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

    const onFlash = jest.fn();

    render(
      <CustomSettings
        index={0}
        onFlash={onFlash}
        unsupported={false}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.queryByText(/unsupportedFirmware/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByTestId('STARTUP_POWER_MIN'), {
      target: {
        value: 1250,
        name: 'STARTUP_POWER_MIN',
      },
    });
    fireEvent.blur(screen.getByTestId('STARTUP_POWER_MIN'));
  });

  it('should handle out of sync settings', () => {
    const availableSettings = {
      LAYOUT_REVISION: 201,
      MAIN_REVISION: 0,
      NAME: 'FW name',
      SUB_REVISION: 100,
    };
    storeRef.store.dispatch(setMaster(availableSettings));

    const esc = {
      firmwareName: 'Bluejay',
      layoutRevision: 207,
      meta: { available: true },
      settings: { STARTUP_POWER_MIN: 1125 },
    };

    const escs = [];
    for(let i = 0; i < 4; i += 1) {
      const current = JSON.parse(JSON.stringify(esc));

      if(i === 3) {
        current.settings.STARTUP_POWER_MIN = 1150;
      }
      escs.push(current);
    }
    storeRef.store.dispatch(setIndividual(escs));

    const onFlash = jest.fn();

    /* eslint-disable */
    const { container } = render(
      <CustomSettings
        availableSettings={availableSettings}
        directInput={false}
        escs={escs}
        index={0}
        onFlash={onFlash}
        unsupported={false}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(container.querySelector('.not-in-sync')).toBeInTheDocument();
  });

  it('should display warning when firmware is unsopported', () => {
    const availableSettings = {};
    storeRef.store.dispatch(setMaster(availableSettings));

    const escs = [
      {
        firmwareName: 'JESC',
        meta: { available: true },
        settings: { MODE: 1 },
      },
    ];
    storeRef.store.dispatch(setIndividual(escs));

    const onFlash = jest.fn();

    render(
      <CustomSettings
        index={0}
        onFlash={onFlash}
        unsupported
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/unsupportedFirmware/i)).toBeInTheDocument();
    expect(screen.getByText(/common:useDedicatedConfigurator/i)).toBeInTheDocument();
  });

  it('should handle overrides', () => {
    const availableSettings = {
      MAIN_REVISION: 14,
      NAME: 'FW name',
      SUB_REVISION: 5,
      PROGRAMMING_BY_TX: 0,
    };
    storeRef.store.dispatch(setMaster(availableSettings));

    const esc = {
      firmwareName: 'BLHeli',
      layoutRevision: 21,
      meta: { available: true },
      settings: {
        MODE: 0,
        STARTUP_BEEP: 0,
        PROGRAMMING_BY_TX: 0,
      },
      make: 'make 1234',
      individualSettings: {
        MAIN_REVISION: 0,
        SUB_REVISION: 201,
        NAME: 'Bluejay (Beta)',
        PROGRAMMING_BY_TX: 0,
      },
    };

    const escs = [];
    for(let i = 0; i < 4; i += 1) {
      const current = { ...esc };
      escs.push(current);
    }
    storeRef.store.dispatch(setIndividual(escs));

    const onFlash = jest.fn();

    render(
      <CustomSettings
        index={0}
        onFlash={onFlash}
        unsupported={false}
      />,
      { wrapper: storeRef.wrapper }
    );

    userEvent.click(screen.getByRole(/checkbox/i, { name: 'PROGRAMMING_BY_TX' }));
    const { master } = storeRef.store.getState().escs;
    expect(master.PROGRAMMING_BY_TX).toEqual(1);
  });

  it('should group settings', () => {
    const availableSettings = {
      MAIN_REVISION: 14,
      NAME: 'FW name',
      SUB_REVISION: 5,
    };
    storeRef.store.dispatch(setMaster(availableSettings));

    const escs = [
      {
        firmwareName: 'AM32',
        layoutRevision: 2,
        meta: { available: true },
        settings: { MODE: 1 },
      },
    ];
    storeRef.store.dispatch(setIndividual(escs));

    const onFlash = jest.fn();

    render(
      <CustomSettings
        index={0}
        onFlash={onFlash}
        unsupported={false}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/commonParameters/i)).toBeInTheDocument();
    expect(screen.getByText(/groups:general/i)).toBeInTheDocument();
  });

  /*
  it('should handle sanitizations', () => {
    storeRef.store.dispatch(update({
      name: 'directInput',
      value: true,
    }));

    storeRef.store.dispatch(setIndividual([
      {
        firmwareName: 'Bluejay',
        layoutRevision: 208,
        meta: { available: true },
        settings: {
          PWM_FREQUENCY: 192,
          PWM_THRESHOLD_LOW: 128,
          PWM_THRESHOLD_HIGH: 128,
        },
      },
    ]));

    storeRef.store.dispatch(setMaster(
      {
        MAIN_REVISION: 14,
        NAME: 'FW name',
        SUB_REVISION: 5,
        PWM_FREQUENCY: 192,
        PWM_THRESHOLD_LOW: 128,
        PWM_THRESHOLD_HIGH: 128,
      }
    ));

    const onFlash = jest.fn();

    render(
      <CustomSettings
        index={0}
        onFlash={onFlash}
        unsupported={false}
      />,
      { wrapper: storeRef.wrapper }
    );

    expect(Math.round(screen.getByTestId('THRESHOLD_48to24').value)).toEqual(50);

    fireEvent.change(screen.getByTestId('THRESHOLD_48to24'), {
      target: { value: 255 },
    });
    fireEvent.blur(screen.getByTestId('THRESHOLD_48to24'));

    expect(Math.round(screen.getByTestId('THRESHOLD_48to24').value)).toEqual(100);
  });
  */
});
