
  // tripsSlice.ts
  import { createSlice, PayloadAction } from '@reduxjs/toolkit';
  import { ITripDetails, TripsState } from '../../interfaces/interfaces';
  
  const initialState: TripsState = {
    trips: [],
    isLoading: false,
    error: null,
    page: '1'
  };
  
  const tripsSlice = createSlice({
    name: 'trips',
    initialState,
    reducers: {
      setTrips: (state, action: PayloadAction<ITripDetails[]>) => {
        state.trips = action.payload;
      },
      setLoading: (state, action: PayloadAction<boolean>) => {
        state.isLoading = action.payload;
      },
      setError: (state, action: PayloadAction<string | null>) => {
        state.error = action.payload;
      },
      setPage: (state, action: PayloadAction<string>) => {
        state.page = action.payload;
      }
    }
  });
  
  export const { setTrips, setLoading, setError, setPage } = tripsSlice.actions;
  export default tripsSlice.reducer;