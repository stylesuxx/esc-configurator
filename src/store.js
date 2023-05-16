import { configureStore } from '@reduxjs/toolkit';

import configsReducer from './Containers/App/configsSlice';
import languageReducer from './Components/LanguageSelection/languageSlice';
import logReducer from './Components/Log/logSlice';
import melodiesReducer from './Components/MelodyEditor/melodiesSlice';
import mspReducer from './Containers/App/mspSlice';
import settingsReducer from './Components/AppSettings/settingsSlice';
import statusReducer from './Components/Statusbar/statusSlice';

export const store = configureStore({
  reducer: {
    configs: configsReducer,
    language: languageReducer,
    log: logReducer,
    melodies: melodiesReducer,
    msp: mspReducer,
    settings: settingsReducer,
    status: statusReducer,
  },
});
