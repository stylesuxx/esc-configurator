import { configureStore } from '@reduxjs/toolkit';

import statusReducer from './Components/Statusbar/statusSlice';

export const store = configureStore({ reducer: { status: statusReducer } });
