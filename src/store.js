import { configureStore } from '@reduxjs/toolkit';

import settingsReducer from './Components/AppSettings/settingsSlice';
import statusReducer from './Components/Statusbar/statusSlice';

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    status: statusReducer,
  },
});
