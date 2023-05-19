import { createSlice } from '@reduxjs/toolkit';

const unsupportedNames = ['JESC', 'BLHeli_M', 'BLHeli_32'];

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

export const selectCanFlash = (state) => {
  const {
    individual,
    master,
  } = state.escs;
  const {
    isReading,
    isSelecting,
    isFlashing,
    isWriting,
  } = state.state;

  const disableFlashingNames = ['BLHeli_32'];
  const disableFlashing = disableFlashingNames.includes(master.NAME);

  return (
    (individual.length > 0) &&
    !isReading &&
    !isSelecting &&
    !isFlashing &&
    !isWriting &&
    !disableFlashing
  );
};

export const selectIsSupported = (state) => {
  const unsupported = unsupportedNames.includes(state.escs.master.NAME);

  return !unsupported;
};

export const selectCanWrite = (state) => {
  const { individual } = state.escs;
  const {
    isReading,
    isSelecting,
    isFlashing,
    isWriting,
  } = state.state;

  return (
    (individual.length > 0) &&
    !isReading &&
    !isSelecting &&
    !isFlashing &&
    !isWriting &&
    selectIsSupported(state)
  );
};

export const selectCanRead = (state) => {
  const {
    isReading,
    isSelecting,
    isFlashing,
    isWriting,
  } = state.state;

  return (
    !isReading &&
    !isSelecting &&
    !isFlashing &&
    !isWriting
  );
};

export default stateSlice.reducer;
