import { createSlice } from '@reduxjs/toolkit';

import { loadMelodies } from '../../utils/LocalStorage';
import melodies from '../../melodies.json';

const initialState = {
  current: [
    "bluejay:b=570,o=4,d=32:4b,p,4e5,p,4b,p,4f#5,2p,4e5,2b5,8b5",
    "bluejay:b=570,o=4,d=32:4b,p,4e5,p,4b,p,4f#5,2p,4e5,2b5,8b5",
    "bluejay:b=570,o=4,d=32:4b,p,4e5,p,4b,p,4f#5,2p,4e5,2b5,8b5",
    "bluejay:b=570,o=4,d=32:4b,p,4e5,p,4b,p,4f#5,2p,4e5,2b5,8b5",
  ],
  show: false,
  dummy: true,
  default: melodies,
  custom: loadMelodies(),
  supported: false,
};

export const melodiesSlice = createSlice({
  name: 'melodies',
  initialState,
  reducers: {
    show: (state) => {
      state.show = true;
    },
    hide: (state) => {
      state.show = false;
    },
    dummy: (state) => {
      state.dummy = true;
    },
    prod: (state) => {
      state.dummy = false;
    },
    update: (state, action) => {
      const {
        index,
        melody,
      } = action.payload;

      const newState = [...state.current];
      newState[index] = melody;
      state.current = newState;
    },
    updateAll: (state, action) => {
      state.current = action.payload;
      state.supported = true;
    },
    save: (state, action) => {
      const {
        name,
        tracks,
      } = action.payload;

      const storedMelodies = JSON.parse(localStorage.getItem('melodies')) || [];
      const match = storedMelodies.findIndex((melody) => melody.name === name);

      // Override melody if a custom melody with this name is available.
      if(match >= 0) {
        storedMelodies[match].tracks = tracks;
      } else {
        storedMelodies.push(
          {
            name,
            tracks,
          }
        );
      }

      localStorage.setItem('melodies', JSON.stringify(storedMelodies));

      state.custom = loadMelodies();
    },
    del: (state, action) => {
      const name = action.payload;

      const storedMelodies = JSON.parse(localStorage.getItem('melodies')) || [];
      const match = storedMelodies.findIndex((melody) => melody.name === name);
      if(match >= 0) {
        storedMelodies.splice(match, 1);
        localStorage.setItem('melodies', JSON.stringify(storedMelodies));

        state.custom = loadMelodies();
      }
    },
    reset: () => initialState,
  },
});

export const {
  del,
  dummy,
  hide,
  prod,
  reset,
  save,
  show,
  update,
  updateAll,
} = melodiesSlice.actions;

export const selectCurrent = (state) => state.melodies.current;
export const selectCustom = (state) => state.melodies.custom;
export const selectDefault = (state) => state.melodies.default;
export const selectDummy = (state) => state.melodies.dummy;
export const selectShow = (state) => state.melodies.show;
export const selectSupported = (state) => state.melodies.supported;

export default melodiesSlice.reducer;
