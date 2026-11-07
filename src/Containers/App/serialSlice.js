import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  baudRate: 115200,
  checked: false,
  connected: false,
  connectionMode: 'fc',
  debugMode: false,
  fourWay: false,
  hasSerial: false,
  open: false,
  portNames: [],
};

export const serialSlice = createSlice({
  name: 'serial',
  initialState,
  reducers: {
    setBaudRate: (state, action) => {
      state.baudRate = action.payload;
    },
    setChecked: (state, action) => {
      state.checked = action.payload;
    },
    setConnected: (state, action) => {
      state.connected = action.payload;
    },
    setConnectionMode: (state, action) => {
      state.connectionMode = action.payload;
    },
    setDebugMode: (state, action) => {
      state.debugMode = action.payload;
    },
    setFourWay: (state, action) => {
      state.fourWay = action.payload;
    },
    setHasSerial: (state, action) => {
      state.hasSerial = action.payload;
    },
    setOpen: (state, action) => {
      state.open = action.payload;
    },
    setPortNames: (state, action) => {
      state.portNames = action.payload;
    },
  },
});

export const {
  setBaudRate,
  setChecked,
  setConnected,
  setConnectionMode,
  setDebugMode,
  setFourWay,
  setHasSerial,
  setOpen,
  setPortNames,
  reset,
} = serialSlice.actions;

export const selectBaudRate = (state) => state.serial.baudRate;
export const selectChecked = (state) => state.serial.checked;
export const selectConnected = (state) => state.serial.connected;
export const selectConnectionMode = (state) => state.serial.connectionMode;
export const selectDebugMode = (state) => state.serial.debugMode;
export const selectFourWay = (state) => state.serial.fourWay;
export const selectHasSerial = (state) => state.serial.hasSerial;
export const selectOpen = (state) => state.serial.open;
export const selectPortNames = (state) => state.serial.portNames;

export default serialSlice.reducer;
