import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  versions: {},
  escs: {},
};

export const configsSlice = createSlice({
  name: 'configs',
  initialState,
  reducers: { set: (state, action) => action.payload },
});

export const { set } = configsSlice.actions;

export const selectEscs = (state) => state.configs.escs;
export const selectVersions = (state) => state.configs.versions;

export default configsSlice.reducer;
