import { createSlice } from '@reduxjs/toolkit';

import { loadLanguage } from '../../utils/LocalStorage';
import settings from '../../settings.json';

const initialState = {
  available: settings.availableLanguages,
  current: loadLanguage(),
};

export const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    update: (state, action) => {
      state.current = action.payload;

      localStorage.setItem('language', action.payload);
    },
  },
});

export const { update } = languageSlice.actions;

export const selectCurrent = (state) => state.language.current;
export const selectAvailable = (state) => state.language.available;

export default languageSlice.reducer;
