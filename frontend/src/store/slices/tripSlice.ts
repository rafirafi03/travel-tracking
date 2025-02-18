import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TripState = {
  selectedTrips: string[]; // Store selected trip IDs
};

const initialState: TripState = {
  selectedTrips: [],
};

const tripSlice = createSlice({
  name: "trip",
  initialState,
  reducers: {
    setSelectedTrips: (state, action: PayloadAction<string[]>) => {
      state.selectedTrips = action.payload;
    }
  },
});

export const { setSelectedTrips } = tripSlice.actions;
export default tripSlice.reducer;
