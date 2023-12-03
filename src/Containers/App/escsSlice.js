import { createSlice } from '@reduxjs/toolkit';

/**
 * NOTE: The individual array holds individual ESC settings, the actual index
 *       in the array does not represent the actual index of the ESC. If for
 *       example only one ESC is attached, the individual length will have a
 *       length of 1. The actual index of the ESC must be reat from that object.
 *
 *       Eg.: Only one ESC is attached to motor pin 2 an an FC where 4 ESCs
 *            are expected. The individual array will have a length of 1, but
 *            at index 0 it will have the settings for the ESC attached to motor
 *            pin 2.
 */

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
    updateIndividual: (state) => {
      const newIndividual = [];
      for(let i = 0; i < state.individual.length; i += 1) {
        const newSettings = {
          ...state.individual[i],
          settings: { ...state.master },
        };

        newIndividual.push(newSettings);
      }

      state.individual = newIndividual;
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

      for(let i = 0; i < state.individual.length; i += 1) {
        if(state.individual[i].index === index) {
          state.individual[i] = {
            ...state.individual[i],
            ...settings,
          };

          break;
        }
      }
    },
  },
});

export const {
  setConnected,
  setMaster,
  setTargets,
  setIndividual,
  setIndividualAtIndex,
  updateIndividual,
} = escsSlice.actions;

export const selectConnected = (state) => state.escs.connected;
export const selectTargets = (state) => state.escs.targets;
export const selectMaster = (state) => state.escs.master;
export const selectIndividual = (state) => state.escs.individual;

export default escsSlice.reducer;
