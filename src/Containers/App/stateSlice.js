import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isReading: false,
  isWriting: false,
  isSelecting: false,
  isFlashing: false,
  isConnecting: false,
  isDisconnecting: false,
};

export const stateSlice = createSlice({
  name: 'state',
  initialState,
  reducers: {
    setReading: (state, action) => {
      state.isReading = action.payload;
    },
    setWriting: (state, action) => {
      state.isWriting = action.payload;
    },
    setSelecting: (state, action) => {
      state.isSelecting = action.payload;
    },
    setFlashing: (state, action) => {
      state.isFlashing = action.payload;
    },
    setConnecting: (state, action) => {
      state.isConnecting = action.payload;
    },
    setDisconnecting: (state, action) => {
      state.isDisconnecting = action.payload;
    },
    reset: () => initialState,
  },
});

export const {
  reset,
  setReading,
  setWriting,
  setSelecting,
  setFlashing,
  setConnecting,
  setDisconnecting,
} = stateSlice.actions;

export const selectState = (state) => state.state;
export const selectIsReading = (state) => state.state.isReading;
export const selectIsWriting = (state) => state.state.isWriting;
export const selectIsSelecting = (state) => state.state.isSelecting;
export const selectIsFlashing = (state) => state.state.isFlashing;
export const selectIsConnecting = (state) => state.state.isConnecting;
export const selectIsDisconnecting = (state) => state.state.isDisconnecting;

export default stateSlice.reducer;
