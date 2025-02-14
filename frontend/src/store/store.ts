import { configureStore } from "@reduxjs/toolkit";
import { apiSlices } from "./slices/apiSlices";
import tripReducer from './slices/tripSlice'

export const store = configureStore({
  reducer: {
    [apiSlices.reducerPath]: apiSlices.reducer,
    trip: tripReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlices.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
