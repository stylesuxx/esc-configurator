import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import logReducer, {
  add,
  addMessage,
} from '../logSlice';

import settingsReducer, { update } from '../../AppSettings/settingsSlice';

import Log from '../';

jest.mock('i18next', () => ({ t: (key) => key }) );

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

function setupTestStore() {
  const refObj = {};

  beforeEach(() => {
    const store = configureStore({
      reducer: {
        log: logReducer,
        settings: settingsReducer,
      },
      preloadedState: {
        log: {
          log: [],
          logTimestamped: [],
        },
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

describe('Log', () => {
  const storeRef = setupTestStore();

  it('should display log messages', async() => {
    let log = storeRef.store.getState().log;
    expect(log.log.length).toEqual(0);
    expect(log.logTimestamped.length).toEqual(0);

    await storeRef.store.dispatch(addMessage({
      message: 'line1',
      params: {},
    }));

    await storeRef.store.dispatch(addMessage({
      message: 'line2',
      params: {},
    }));

    render(
      <Log />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/line1/i)).toBeInTheDocument();
    expect(screen.getByText(/line2/i)).toBeInTheDocument();
    expect(screen.getByText(/showLog/i)).toBeInTheDocument();

    log = storeRef.store.getState().log;
    expect(log.log.length).toEqual(2);
    expect(log.logTimestamped.length).toEqual(2);
  });

  it('should expand log', () => {
    render(
      <Log />,
      { wrapper: storeRef.wrapper }
    );

    userEvent.click(screen.getByText(/showLog/i));
    expect(screen.queryByText(/showLog/i)).not.toBeInTheDocument();
    expect(screen.getByText(/hideLog/i)).toBeInTheDocument();
  });
});

describe('logSlice', () => {
  const storeRef = setupTestStore();

  it('should add a log message', () => {
    let log = storeRef.store.getState().log;
    expect(log.log.length).toEqual(0);

    storeRef.store.dispatch(add('foobar'));

    log = storeRef.store.getState().log;
    expect(log.log.length).toEqual(1);
  });

  it('should add a timestamped message', async() => {
    let log = storeRef.store.getState().log;
    expect(log.logTimestamped.length).toEqual(0);

    await storeRef.store.dispatch(addMessage({
      message: 'line1',
      params: {},
    }));

    log = storeRef.store.getState().log;
    expect(log.logTimestamped.length).toEqual(1);
  });

  it('should add and loga timestamped message', async() => {
    global.console.log = jest.fn();

    let log = storeRef.store.getState().log;
    expect(log.logTimestamped.length).toEqual(0);
    storeRef.store.dispatch(update({
      name: 'printLogs',
      value: true,
    }));

    await storeRef.store.dispatch(addMessage({
      message: 'line1',
      params: {},
      log: true,
    }));

    log = storeRef.store.getState().log;
    expect(log.logTimestamped.length).toEqual(1);
    expect(global.console.log).toHaveBeenCalled();
  });
});
