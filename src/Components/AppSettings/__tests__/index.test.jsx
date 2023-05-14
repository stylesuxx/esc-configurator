import React from 'react';
import {
  render, screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import { show } from '../settingsSlice';
import settingsReducer from '../settingsSlice';

import AppSettings from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

function setupTestStore() {
  const refObj = {};

  beforeEach(() => {
    const store = configureStore({ reducer: { settings: settingsReducer } });
    refObj.store = store;
    refObj.wrapper = ({ children }) => (
      <Provider store={store}>
        {children}
      </Provider>
    );
  });

  return refObj;
}

function setupInvalidTestStore() {
  const refObj = {};

  beforeEach(() => {
    const store = configureStore({
      reducer: { settings: settingsReducer },
      preloadedState: {
        settings: {
          show: true,
          settings: {
            invalid: {
              type: 'invalid',
              value: 'invalid',
            },
          },
        },
      },
    }
    );
    refObj.store = store;
    refObj.wrapper = ({ children }) => (
      <Provider store={store}>
        {children}
      </Provider>
    );
  });

  return refObj;
}

describe('AppSettings', () => {
  const storeRef = setupTestStore();
  const invalidStoreRef = setupInvalidTestStore();

  it('should displays overlay', () => {
    render(
      <AppSettings />,
      { wrapper: storeRef.wrapper }
    );

    storeRef.store.dispatch(show());

    expect(screen.getByText(/settingsHeader/i)).toBeInTheDocument();
    expect(screen.getByText(/close/i)).toBeInTheDocument();
  });

  it('should handle clicks on checkbox', () => {
    render(
      <AppSettings />,
      { wrapper: storeRef.wrapper }
    );

    storeRef.store.dispatch(show());

    expect(screen.getByText(/settingsHeader/i)).toBeInTheDocument();

    userEvent.click(screen.getByRole(/checkbox/i, { name: 'directInput' }));

    const settings = storeRef.store.getState().settings.settings;
    expect(settings.directInput.value).toBeTruthy();
  });

  it('should close the overlay', () => {
    render(
      <AppSettings />,
      { wrapper: storeRef.wrapper }
    );

    storeRef.store.dispatch(show());

    userEvent.click(screen.getByText(/close/i));

    expect(screen.queryByText(/settingsHeader/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/close/i)).not.toBeInTheDocument();
  });

  it('should handle invalid setting type', () => {
    render(
      <AppSettings />,
      { wrapper: invalidStoreRef.wrapper }
    );

    storeRef.store.dispatch(show());

    expect(screen.getByText(/settingsHeader/i)).toBeInTheDocument();
  });
});
