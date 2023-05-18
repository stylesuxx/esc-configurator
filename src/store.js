import { configureStore } from '@reduxjs/toolkit';

import configsReducer from './Containers/App/configsSlice';
import cookiereducer from './Components/CookieConsent/cookieSlice';
import languageReducer from './Components/LanguageSelection/languageSlice';
import logReducer from './Components/Log/logSlice';
import melodiesReducer from './Components/MelodyEditor/melodiesSlice';
import mspReducer from './Containers/App/mspSlice';
import serialReducer from './Containers/App/serialSlice';
import settingsReducer from './Components/AppSettings/settingsSlice';
import stateReducer from './Containers/App/stateSlice';
import statusReducer from './Components/Statusbar/statusSlice';

export const store = configureStore({
  reducer: {
    configs: configsReducer,
    cookie: cookiereducer,
    language: languageReducer,
    log: logReducer,
    melodies: melodiesReducer,
    msp: mspReducer,
    serial: serialReducer,
    settings: settingsReducer,
    state: stateReducer,
    status: statusReducer,
  },
});
