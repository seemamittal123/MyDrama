import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  latest: [],
  tranding: [],
  popular: [],
  allShows: [],
  upcomming: [],
};
const showSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAllShows: (state, action) => {
      state.allShows = action.payload;
    },
    setLatest: (state, action) => {
      state.latest = action.payload;
    },
    setPopular: (state, action) => {
      state.popular = action.payload;
    },
    setTranding: (state, action) => {
      state.tranding = action.payload;
    },
    setUpcomming: (state, action) => {
      state.upcomming = action.payload;
    },
  },
});

export const { setLatest, setPopular, setTranding, setAllShows ,setUpcomming} =
  showSlice.actions;
export default showSlice.reducer;
