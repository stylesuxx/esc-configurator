import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import cookieReducer from '../cookieSlice';

import CookieConsent from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

function setupTestStore() {
  const refObj = {};

  beforeEach(() => {
    const store = configureStore({ reducer: { cookie: cookieReducer } });
    refObj.store = store;
    refObj.wrapper = ({ children }) => (
      <Provider store={store}>
        {children}
      </Provider>
    );
  });

  return refObj;
}

describe('CookieConsent', () => {
  const storeRef = setupTestStore();

  it('should handle consent acctept click', () => {
    let cookie = storeRef.store.getState().cookie;
    expect(cookie.accepted).toBeFalsy();

    render(
      <CookieConsent />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/Accept all/i)).toBeInTheDocument();
    userEvent.click(screen.getByText(/Accept all/i));

    cookie = storeRef.store.getState().cookie;
    expect(cookie.accepted).toBeTruthy();

    cookie = storeRef.store.getState().cookie;
    expect(cookie.accepted).toBeTruthy();
  });
});