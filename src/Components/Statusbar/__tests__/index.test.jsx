import React from 'react';
import {
  act,
  render,
  screen,
} from '@testing-library/react';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import { incrementByAmount } from '../statusSlice';
import statusReducer from '../statusSlice';

import StatusBar from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

function setupTestStore() {
  const refObj = {};

  beforeEach(() => {
    const store = configureStore({ reducer: { status: statusReducer } });
    refObj.store = store;
    refObj.wrapper = ({ children }) => (
      <Provider store={store}>
        {children}
      </Provider>
    );
  });

  return refObj;
}

describe('Statusbar', () => {
  const storeRef = setupTestStore();

  it('should render without utilization callback', async () => {
    render(
      <StatusBar />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/statusbarPortUtilization/i)).toBeInTheDocument();
    expect(screen.getByText(/statusbarPacketError 0/i)).toBeInTheDocument();

    await act(async ()=> {
      await new Promise((r) => {
        setTimeout(r, 1200);
      });
    });
    expect(screen.getByText('statusbarPortUtilization D: 0% U: 0%')).toBeInTheDocument();
  });

  it('should display increased packet errors', async () => {
    render(
      <StatusBar />,
      { wrapper: storeRef.wrapper }
    );

    storeRef.store.dispatch(incrementByAmount(100));
    expect(screen.getByText(/statusbarPacketError 100/i)).toBeInTheDocument();

    storeRef.store.dispatch(incrementByAmount(100));
    expect(screen.getByText(/statusbarPacketError 200/i)).toBeInTheDocument();
  });

  it('should render with utilization callback', async () => {
    let getUtilization = jest.fn(() => ({
      up: 10,
      down: 20,
    }));

    render(
      <StatusBar getUtilization={getUtilization} />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/statusbarPortUtilization/i)).toBeInTheDocument();
    expect(screen.getByText(/statusbarPacketError 0/i)).toBeInTheDocument();

    await act(async ()=> {
      await new Promise((r) => {
        setTimeout(r, 1200);
      });
    });

    expect(getUtilization).toHaveBeenCalled();
    expect(screen.getByText('statusbarPortUtilization D: 20% U: 10%')).toBeInTheDocument();
  });
});
