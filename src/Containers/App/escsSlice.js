import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connected: 0,
  master: {},
  targets: [],
  individual: [],
};

export const escsSlice = createSlice({
  name: 'escs',
  initialState,
  reducers: {
    setConnected: (state, action) => {
      state.connected = action.payload;
    },
    setMaster: (state, action) => {
      state.master = action.payload;
    },
    setTargets: (state, action) => {
      state.targets = action.payload;
    },
    setIndividual: (state, action) => {
      state.individual = action.payload;
    },
    setIndividualAtIndex: (state, action) => {
      const {
        index,
        settings,
      } = action.payload;

      state.individual[index] = {
        ...state.individual[index],
        ...settings,
      };
    },
  },
});

export const {
  setConnected,
  setMaster,
  setTargets,
  setIndividual,
  setIndividualAtIndex,
} = escsSlice.actions;

export const selectConnected = (state) => state.escs.connected;
export const selectTargets = (state) => state.escs.targets;
export const selectMaster = (state) => state.escs.master;
export const selectIndividual = (state) => state.escs.individual;

export default escsSlice.reducer;
