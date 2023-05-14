import { configureStore } from '@reduxjs/toolkit';

import languageReducer from './Components/LanguageSelection/languageSlice';
import settingsReducer from './Components/AppSettings/settingsSlice';
import statusReducer from './Components/Statusbar/statusSlice';

export const store = configureStore({
  reducer: {
    language: languageReducer,
    settings: settingsReducer,
    status: statusReducer,
  },
});
