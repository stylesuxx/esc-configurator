import { createAsyncThunk } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import { getAppSetting } from '../../utils/helpers/General';

import sources from '../../sources';
import { addMessage } from '../../Components/Log/logSlice';

const initialState = {
  versions: {},
  escs: {},
};

export const fetch = createAsyncThunk(
  'configs/fetch',
  async(payload, thunkApi) => {
    const configs = {
      versions: {},
      escs: {},
    };

    for(let i = 0; i < sources.length; i += 1) {
      const source = sources[i];
      const name = source.getName();

      source.setSkipCache(getAppSetting('skipCache'));

      try {
        configs.versions[name] = await source.getVersions();
        configs.escs[name] = source.getEscLayouts();
      } catch(e) {
        thunkApi.dispatch(addMessage({
          message: 'fetchingFilesFailed',
          params: { name: name },
        }));

        configs.versions[name] = [];
        configs.escs[name] = [];
      }
    }

    return configs;
  }
);

export const configsSlice = createSlice({
  name: 'configs',
  initialState,
  reducers: { set: (state, action) => action.payload },
  extraReducers: (builder) => {
    builder.addCase(fetch.fulfilled, (state, action) => {
      const {
        versions,
        escs,
      } = action.payload;

      state.versions = versions;
      state.escs = escs;
    });
  },
});

export const { set } = configsSlice.actions;

export const selectEscs = (state) => state.configs.escs;
export const selectVersions = (state) => state.configs.versions;

export default configsSlice.reducer;
