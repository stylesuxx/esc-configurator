import { createSlice } from '@reduxjs/toolkit';

const initialState = { features: {} };

export const mspSlice = createSlice({
  name: 'msp',
  initialState,
  reducers: {
    set: (state, action) => {
      state.features = action.payload;
    },
  },
});

export const { set } = mspSlice.actions;

export const selectFeatures = (state) => state.msp.features;

export default mspSlice.reducer;
