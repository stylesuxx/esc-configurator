import { createAsyncThunk } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import dateFormat from 'dateformat';
import i18next from 'i18next';

import {
  clearLog,
  loadLog,
} from '../../utils/LocalStorage';

const initialState = {
  log: loadLog(),
  logTimestamped: [],
};

const lineFormat = (line) => {
  const now = dateFormat(new Date(), 'yyyy/mm/dd HH:MM:ss');
  return `${now}: ${line}`;
};

const lineFormatTimestamped = (html) => {
  const now = new Date();
  const formattedDate = dateFormat(now, 'yyyy-mm-dd');
  const formattedTime = dateFormat(now, 'HH:MM:ss');

  return {
    html,
    date: formattedDate,
    time: formattedTime,
  };
};

export const addMessage = createAsyncThunk(
  'log/addMessage',
  async(payload, thunkApi) => {
    const settings = thunkApi.getState().settings.settings;

    payload.log = settings.printLogs.value;
    return payload;
  }
);

export const logSlice = createSlice({
  name: 'log',
  initialState,
  reducers: {
    add: (state, action) => {
      const line = lineFormat(action.payload);

      state.log = [...state.log, line];
      localStorage.setItem('log', JSON.stringify(state.log));
    },
    clear: (state) => {
      clearLog();
      state.log = loadLog();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(addMessage.fulfilled, (state, action) => {
      const {
        message,
        params,
        log,
      } = action.payload;
      const translation = i18next.t(`log:${message}`, params);
      const lineTimestamped = lineFormatTimestamped(translation);
      state.logTimestamped = [...state.logTimestamped, lineTimestamped];

      // Save to debug log in english
      params.lng = 'en';
      const translationEn = i18next.t(`log:${message}`, params);
      const line = lineFormat(translationEn);
      state.log = [...state.log, line];

      localStorage.setItem('log', JSON.stringify(state.log));

      if(log) {
        console.log(translationEn);
      }
    });
  },
});

export const {
  add,
  clear,
} = logSlice.actions;

export const selectLog = (state) => state.log.log;
export const selectLogTimestamped = (state) => state.log.logTimestamped;

export default logSlice.reducer;
