import React from 'react';
import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';

import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

import languageReducer from '../languageSlice';

import LanguageSelection from '../';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));
jest.mock('i18next', () => ({ changeLanguage: (language) => (language) }));

function setupTestStore() {
  const refObj = {};

  beforeEach(() => {
    const store = configureStore({ reducer: { language: languageReducer } });
    refObj.store = store;
    refObj.wrapper = ({ children }) => (
      <Provider store={store}>
        {children}
      </Provider>
    );
  });

  return refObj;
}

/*
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
*/

describe('LanguageSelection', () => {
  const storeRef = setupTestStore();
  //const invalidStoreRef = setupInvalidTestStore();

  it('should displays language options', () => {
    render(
      <LanguageSelection />,
      { wrapper: storeRef.wrapper }
    );

    expect(screen.getByText(/Deutsch/i)).toBeInTheDocument();
    expect(screen.getByText(/English/i)).toBeInTheDocument();
  });

  it('should handle language selection', () => {
    render(
      <LanguageSelection />,
      { wrapper: storeRef.wrapper }
    );

    fireEvent.change(screen.getByRole(/combobox/i), { target: { value: 'de' } });

    const language = storeRef.store.getState().language;
    expect(language.current).toEqual('de');
  });
});
