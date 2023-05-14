import { createSlice } from '@reduxjs/toolkit';

const initialState = { packetErrors: 0 };

export const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    incrementByAmount: (state, action) => {
      state.packetErrors += action.payload;
    },
  },
});

export const { incrementByAmount } = statusSlice.actions;

export const selectPacketErrors = (state) => state.status.packetErrors;

export default statusSlice.reducer;
