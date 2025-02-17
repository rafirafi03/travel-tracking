import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { apiSlices } from "./slices/apiSlices";
import tripReducer from "./slices/tripSlice";
import storage from "redux-persist/lib/storage"; // Use localStorage
import { persistReducer, persistStore } from "redux-persist";

// 🔹 Define Persist Configuration
const persistConfig = {
  key: "trip",
  storage, // Saves to localStorage
};

const persistedTripReducer = persistReducer(persistConfig, tripReducer);

// 🔹 Combine Reducers
const rootReducer = combineReducers({
  [apiSlices.reducerPath]: apiSlices.reducer,
  trip: persistedTripReducer, // 🔥 Wrap tripReducer
});

// 🔹 Create Redux Store with Persisted Reducer
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // 🔥 Required to avoid serialization issues
    }).concat(apiSlices.middleware),
});

// 🔹 Persist Store
export const persistor = persistStore(store);

// Export Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
