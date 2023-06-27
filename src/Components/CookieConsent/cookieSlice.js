import { createSlice } from '@reduxjs/toolkit';
import TagManager from 'react-gtm-module';

const initialState = { accepted: false };

export const cookieSlice = createSlice({
  name: 'cookie',
  initialState,
  reducers: {
    accept: (state) => {
      state.accepted = true;

      const tagManagerArgs = { gtmId: process.env.REACT_APP_GTM_ID };
      TagManager.initialize(tagManagerArgs);
    },
  },
});

export const { accept } = cookieSlice.actions;

export default cookieSlice.reducer;
