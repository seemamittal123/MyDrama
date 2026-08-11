import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  latest: [],
  tranding: [],
  popular: [],
  allShows: [],
  loading: true,
};
const showSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAllShows: (state, action) => {
      state.allShows = action.payload;
      state.loading = false;
    },
    setNewShows: (state, action) => {
      state.allShows.unshift(action.payload);
      state.loading = false;
    },
    removeShow: (state, action) => {
      const id = action.payload?.toString();
      state.allShows = state.allShows.filter(
        (show) => show?._id?.toString() !== id,
      );
      state.loading = false;
    },
    setLatest: (state, action) => {
      state.latest = action.payload;
      state.loading = false;
    },
    setPopular: (state, action) => {
      state.popular = action.payload;
      state.loading = false;
    },
    setTranding: (state, action) => {
      state.tranding = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setLatest,
  setPopular,
  setTranding,
  setNewShows,
  removeShow,
  setAllShows,
} = showSlice.actions;
export default showSlice.reducer;
